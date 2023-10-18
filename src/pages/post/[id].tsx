import Head from "next/head";
import { api } from "~/utils/api";
import React from "react";

export default function SinglePostPage() {
  return (
    <>
      <Head>
        <title>Post</title>
      </Head>
      <main className="flex h-screen justify-center">
        <div>Single Post Page</div>
      </main>
    </>
  );
}
