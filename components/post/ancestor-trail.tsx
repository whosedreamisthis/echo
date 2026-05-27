import PostCard from "@/components/post/post-card";
import { PostType } from "@/lib/types";

const AncestorTrail = ({ ancestors }: { ancestors: PostType[] }) => {
  if (ancestors.length === 0) return null;

  return (
    <div className="pb-4">
      <div className="flex flex-col gap-4 px-5">
        {ancestors.map((ancestor) => {
          return (
            <div key={ancestor._id} className={`pb-5 border-b`}>
              <PostCard post={ancestor} showThreadLine={true} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AncestorTrail;
