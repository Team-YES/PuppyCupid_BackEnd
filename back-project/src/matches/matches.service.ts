import { Injectable, NotFoundException } from '@nestjs/common';
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

    반드시 성격은 아래 목록에서만 골라야 해. 이 목록에 없는 성격은 절대 사용하면 안 돼.

    [ "활발함", "애교쟁이", "차분함", "고집쟁이", "소심함", "호기심 많음", "지혜로움", "사교적임", "자유로운 영혼", "겸손함", "자기중심적임", "신중함" ]

    출력은 아래 형식의 JSON 배열로 **정확하게** 해줘. 설명은 절대 붙이지 마.

    [
      { "mbti": "ISFP", "personality": ["차분함", "애교쟁이"] },
      ...
    ]
    `;

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-pro-001',
    });

    let rawText: string | undefined;

    try {
      const result = await model.generateContent([prompt]);
      console.log(JSON.stringify(result, null, 2));

      rawText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (error) {
      console.error('Gemini API 호출 에러:', error);
      return null;
    }

    let recommendedCombos: { mbti: string; personality: string[] }[] = [];

    try {
      if (rawText) {
        const cleanText = rawText
          .trim()
          .replace(/^```json\n?/, '')
          .replace(/^```/, '')
          .replace(/```$/, '')
          .replaceAll('```', '');

        const parsed = JSON.parse(cleanText);

        recommendedCombos = parsed.map((combo) => ({
          mbti: combo.mbti,
          personality: combo.personality.map((p: string) => p.trim()),
        }));

        console.log('파싱 성공:', recommendedCombos);
      }
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

    throw new NotFoundException('조건에 맞는 강아지가 없습니다.');
  }
}
