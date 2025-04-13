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
    rejected: { mbti: string; personality: string[] }[] = [],
  ): Promise<Dog | null> {
    const myDog = await this.dogsService.findDogByUserID(userId);
    if (!myDog) throw new Error('강아지 정보를 찾을 수 없습니다.');

    const dogInput = {
      mbti: myDog.mbti,
      personality: myDog.personality.split(',').map((s) => s.trim()),
      traits: [],
    };

    const prompt = `
다음은 한 강아지의 MBTI, 성격, 특징이야.
MBTI: ${dogInput.mbti}
성격: ${dogInput.personality.join(', ')}
특징: ${dogInput.traits.join(', ')}

궁합이 잘 맞는 다른 강아지의 MBTI와 성격 조합을 3개 추천해줘.
아래 형식의 JSON 배열로 정확하게 출력해줘:

[
  { "mbti": "ISFP", "personality": ["차분함", "애정많음"] },
  ...
]
`;

    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const text = await result.response.text();

    let recommendedCombos: { mbti: string; personality: string[] }[] = [];
    try {
      recommendedCombos = JSON.parse(text);
    } catch (err) {
      console.error('Gemini 응답 파싱 실패:', text);
      return null;
    }

    const allDogs = await this.dogsService.findNearbyDogs(myDog.id);

    for (const combo of recommendedCombos) {
      const isRejected = rejected.some(
        (r) =>
          r.mbti === combo.mbti &&
          JSON.stringify(r.personality.sort()) ===
            JSON.stringify(combo.personality.sort()),
      );
      if (isRejected) continue;

      const match = allDogs.find((dog) => {
        if (dog.mbti !== combo.mbti) return false;
        const dogPersonality = dog.personality.split(',').map((s) => s.trim());
        return combo.personality.every((p) => dogPersonality.includes(p));
      });

      if (match) return match;
    }

    return null;
  }
}
