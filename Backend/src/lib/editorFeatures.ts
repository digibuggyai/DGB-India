import { EXPERIMENTAL_TableFeature, type lexicalEditor } from "@payloadcms/richtext-lexical";

type Features = NonNullable<NonNullable<Parameters<typeof lexicalEditor>[0]>["features"]>;

/* The rich-text feature set, in one place.
 *
 * It has to be one place because two things need it and they must agree: the
 * editor the field uses, and the Markdown converter that turns what the blog
 * editor writes into that field. `editorConfigFactory.default` builds Lexical's
 * stock config rather than ours, so a converter built from it silently drops
 * anything the stock set doesn't know — which is how pasted tables ended up as
 * stray pipe characters.
 *
 * Tables are marked experimental by Payload; they are stable enough to store
 * and render, and they bring their own Markdown transformers. */
export const editorFeatures: Features = ({ defaultFeatures }) => [...defaultFeatures, EXPERIMENTAL_TableFeature()];
