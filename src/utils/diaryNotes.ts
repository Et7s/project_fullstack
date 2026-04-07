// sportcenter-wireframes/src/utils/diaryNotes.ts
export interface ParsedDiaryNote {
  workoutType: string;
  comment: string;
}

export const buildDiaryNotes = (workoutType: string, comment: string) => {
  const safeWorkoutType = workoutType.trim();
  const safeComment = comment.trim();

  if (!safeWorkoutType) {
    return safeComment;
  }

  if (!safeComment) {
    return `Тип тренировки: ${safeWorkoutType}`;
  }

  return `Тип тренировки: ${safeWorkoutType}\nКомментарий: ${safeComment}`;
};

export const parseDiaryNotes = (notes?: string | null): ParsedDiaryNote => {
  const raw = (notes || '').trim();
  if (!raw) {
    return { workoutType: '', comment: '' };
  }

  const lines = raw.split('\n').map((line) => line.trim()).filter(Boolean);
  const workoutLine = lines.find((line) => /^тип тренировки\s*:/i.test(line));
  const commentLine = lines.find((line) => /^комментарий\s*:/i.test(line));

  const workoutType = workoutLine ? workoutLine.replace(/^тип тренировки\s*:/i, '').trim() : '';

  if (commentLine) {
    const firstComment = commentLine.replace(/^комментарий\s*:/i, '').trim();
    const rest = lines.filter((line) => line !== workoutLine && line !== commentLine).join('\n').trim();
    return {
      workoutType,
      comment: [firstComment, rest].filter(Boolean).join('\n').trim(),
    };
  }

  if (workoutType) {
    const rest = lines.filter((line) => line !== workoutLine).join('\n').trim();
    return { workoutType, comment: rest };
  }

  return { workoutType: '', comment: raw };
};
