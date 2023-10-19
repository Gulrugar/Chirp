import { SignInButton, useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { toast } from "react-hot-toast";
import React from "react";
import { PostView } from "~/components/postview";
import Image from "next/image";
import { PageLayout } from "~/components/layout";

const CreatePostWizard = () => {
  const { user } = useUser();

  const [input, setInput] = React.useState("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (error) => {
      const zodErrorMessage = error.data?.zodError?.fieldErrors.content;
      if (zodErrorMessage?.[0]) {
        return toast.error(zodErrorMessage[0]);
      }
      const trpcErrorMessage = error.shape?.message;
      if (trpcErrorMessage) {
        return toast.error(trpcErrorMessage);
      }

      return toast.error("Failed to post! Please try again later.");
    },
  });

  if (!user) return null;

  return (
    <div className="flex w-full gap-3">
      <Image
        src={user.imageUrl}
        className="h-14 w-14 rounded-full"
        alt="User profile image"
        width={200}
        height={200}
        placeholder="blur"
        blurDataURL={"/default-avatar.png"}
      />
      <input
        placeholder="Type some emojis!"
        className="grow bg-transparent outline-none"
        type="text"
        // TODO instead of const [input, setInput] = React.useState("");
        // gut this and use zod and react-hook-form
        // validate this on the client side instead
        // of waiting for the server to block after
        // the form is submitted 1:51:50
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") mutate({ content: input });
          }
        }}
        disabled={isPosting}
      />
      {input !== "" && !isPosting && (
        <button onClick={() => mutate({ content: input })}>Post</button>
      )}
      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={20} />
        </div>
      )}
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex flex-col overflow-y-scroll">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={`${fullPost.post.id}`} />
      ))}
    </div>
  );
};

export default function Home() {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  // Start fetching ASAP
  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />;

  return (
    <PageLayout>
      <div className="flex border-b border-slate-400 p-4">
        {!isSignedIn && (
          <div className="flex justify-center">
            <SignInButton />
          </div>
        )}
        {isSignedIn && <CreatePostWizard />}
      </div>
      <Feed />
    </PageLayout>
  );
}
