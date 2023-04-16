import { LoaderFunction } from "react-router-dom";

/*
 * This is a utility type that extracts the data type from a loader function.
 * It is used to type the data returned by useLoaderData.
 * Remix has something like this built-in, but React Router doesn't.
 */
export type LoaderData<TLoaderFn extends LoaderFunction> = Awaited<
  ReturnType<TLoaderFn>
> extends Response | infer D
  ? D
  : never;
