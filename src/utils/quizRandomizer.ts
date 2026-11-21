// src/utils/quizRandomizer.ts
export interface QuizItem {
    q: string;
    options: string[];
    correct: number;
    why: string;
}

function shuffleArray<T>(list: T[]): T[] {
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function buildRandomizedQuiz(quizBank: QuizItem[], count = 10): QuizItem[] {
    return shuffleArray(quizBank)
        .slice(0, count)
        .map((item) => {
            const mapped = item.options.map((text, idx) => ({
                text,
                isRight: idx === item.correct,
            }));
            const shuffledOpts = shuffleArray(mapped);

            return {
                q: item.q,
                options: shuffledOpts.map((o) => o.text),
                correct: shuffledOpts.findIndex((o) => o.isRight),
                why: item.why,
            };
        });
}