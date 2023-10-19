import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postview";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { api } from "~/utils/api";

const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {
  const { data } = api.posts.getById.useQuery({ id });

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{`${data.post.content} - @${data.author.username}`}</title>
      </Head>
      <PageLayout>
        <PostView {...data} />
      </PageLayout>
    </>
  );
};

export default SinglePostPage;

//https://trpc.io/docs/client/nextjs/server-side-helpers#:~:text=SSG%20Helpers%20createProxySSGHelpers%20provides%20you%20with%20a%20set,and%20response%20at%20hand%20like%20you%20usually%20do.
// So in this case we have an internal router
export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const id = context.params?.id;

  // TODO 2:09:00 - see if you can
  // redirect to a different page
  if (typeof id !== "string") throw new Error("No id");

  await ssg.posts.getById.prefetch({ id });

  return {
    props: {
      // takes all the things we fetched, it puts it in a
      // shape that can be parsed throught nextjs server
      // side props, in this case static props and then
      // on the app side since we're wrapping withTRPC
      // ***_app.tsx
      //
      // export default api.withTRPC(MyApp)***
      // we'll actually hydrate all that data through
      // react query
      trpcState: ssg.dehydrate(),
      id,
    },
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};
