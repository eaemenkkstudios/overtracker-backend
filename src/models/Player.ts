import {
  Type, createSchema, typedModel, ExtractDoc, ExtractProps,
} from 'ts-mongoose';

export const ScoreSchema = {
  date: Type.number({ required: true }),
  endorsement: Type.number({ required: true }),
  games: Type.object().of({
    played: Type.number({ required: true }),
    won: Type.number({ required: true }),
  }),
  main: Type.string({ required: true }),
  rank: Type.object({ required: true }).of({
    damage: Type.number({ required: true }),
    support: Type.number({ required: true }),
    tank: Type.number({ required: true }),
  }),
};

export const PlayerSchema = createSchema({
  tag: Type.string({ required: true }),
  platform: Type.string({ required: true }),
  lastUpdate: Type.number({ required: true }),
  portrait: Type.string(),
  scores: Type.array({ required: true, default: [] }).of(ScoreSchema),
  current: Type.object().of(ScoreSchema),
});

export default typedModel('Player', PlayerSchema);
export type PlayerDoc = ExtractDoc<typeof PlayerSchema>;
export type PlayerProps = ExtractProps<typeof PlayerSchema>;
