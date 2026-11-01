import { EXPERIMENTAL_TableFeature, type lexicalEditor } from "@payloadcms/richtext-lexical";

type Features = NonNullable<NonNullable<Parameters<typeof lexicalEditor>[0]>["features"]>;

export const editorFeatures: Features = ({ defaultFeatures }) => [...defaultFeatures, EXPERIMENTAL_TableFeature()];
