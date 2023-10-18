import Head from "next/head";
import { api } from "~/utils/api";
import React from "react";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import type { GetStaticProps, NextPage } from "next";
import { PageLayout } from "~/components/layout";
import Image from "next/image";

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({ username });

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <div className="relative h-36 bg-slate-600">
          <Image
            src={data.imageUrl}
            alt={`${data.username}'s profile pic`}
            width={250}
            height={250}
            className="absolute bottom-0 left-0 -mb-[64px] ml-4 h-32 w-32 rounded-full border-4 border-black bg-black"
            placeholder="blur"
            blurDataURL={"/default-avatar.png"}
          />
        </div>
        <div className="h-[64px]"></div>
        <div className="p-4 text-2xl font-bold">{`@${data.username}`}</div>
        <div className="w-full border-b border-slate-400" />
      </PageLayout>
    </>
  );
};

export default ProfilePage;

//https://trpc.io/docs/client/nextjs/server-side-helpers#:~:text=SSG%20Helpers%20createProxySSGHelpers%20provides%20you%20with%20a%20set,and%20response%20at%20hand%20like%20you%20usually%20do.
// So in this case we have an internal router
export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const slug = context.params?.slug;

  // TODO 2:09:00 - see if you can
  // redirect to a different page
  if (typeof slug !== "string") throw new Error("No slug");

  const username = slug.replace("@", "");

  await ssg.profile.getUserByUsername.prefetch({ username });

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
      username,
    },
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};
