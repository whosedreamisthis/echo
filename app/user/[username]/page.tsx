import React from "react";

const UserPage = async ({
  params,
}: {
  params: Promise<{ username: string }>;
}) => {
  const { username } = await params;

  return (
    <div className="overflow-hidden  w-full max-w-xl mx-auto flex flex-col min-h-screen bg-white pb-10 mb-5 border rounded-2xl p-5 ">
      @{username}
    </div>
  );
};

export default UserPage;
