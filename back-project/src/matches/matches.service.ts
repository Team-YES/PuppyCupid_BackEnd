import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DogsService } from 'src/dogs/dogs.service';
import { Dog } from 'src/dogs/dogs.entity';

@Injectable()
export class MatchesService {
  constructor(private readonly dogsService: DogsService) {}

  private genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  async recommend(
    userId: number,
    latitude: number,
    longitude: number,
    rejected: { mbti: string; personality: string[] }[] = [],
  ): Promise<Dog | null> {
    const myDog = await this.dogsService.findDogByUserID(userId);
    if (!myDog) throw new Error('강아지 정보를 찾을 수 없습니다.');

    await this.dogsService.updateLocation(
      userId,
      myDog.id,
      latitude,
      longitude,
    );

    const dogInput = {
      mbti: myDog.mbti,
      personality: myDog.personality.split(',').map((s) => s.trim()),
    };

    const prompt = `
      다음은 한 강아지의 MBTI와 성격이야.
      MBTI: ${dogInput.mbti}
      성격: ${dogInput.personality.join(', ')}

      궁합이 잘 맞는 다른 강아지의 MBTI와 성격 조합을 3개 추천해줘.
      아래 형식의 JSON 배열로 정확하게 출력해줘:

      [
        { "mbti": "ISFP", "personality": ["차분함", "애정많음"] },
        ...
      ]
    `;

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-pro-001',
    });

    const result = await model.generateContent([prompt]);
    const rawText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;

    let recommendedCombos: { mbti: string; personality: string[] }[] = [];

    try {
      if (rawText) {
        const cleanText = rawText
          .trim()
          .replace(/^```json\n?/, '')
          .replace(/^```/, '')
          .replace(/```$/, '');

        recommendedCombos = JSON.parse(cleanText);
      }

      console.log(recommendedCombos);
    } catch (err) {
      console.error('Gemini 응답 파싱 실패:', rawText);
      return null;
    }

    const allDogs = await this.dogsService.findNearbyDogsForAI(
      latitude,
      longitude,
      myDog.id,
    );

    for (const combo of recommendedCombos) {
      const isRejected = rejected.some(
        (r) =>
          r.mbti === combo.mbti &&
          JSON.stringify(r.personality.sort()) ===
            JSON.stringify(combo.personality.sort()),
      );
      if (isRejected) continue;

      const match =
        allDogs.find((dog) => {
          if (dog.mbti !== combo.mbti) return false;
          const dogPersonality = dog.personality
            .split(',')
            .map((s) => s.trim());
          const overlap = combo.personality.filter((p) =>
            dogPersonality.includes(p),
          );
          return overlap.length >= 1;
        }) ?? allDogs.find((dog) => dog.mbti === combo.mbti);
      if (match) return match;
    }

    return null;
  }
}
