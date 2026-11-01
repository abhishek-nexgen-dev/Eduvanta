import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const ManageCourseTitle = () => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-[2.8vh] ">
      <div>
        <h1 className="text-4xl font-bold">Manage Courses</h1>

        <p className="mt-2 text-zinc-400">View and manage all courses offered by Eduvanta.</p>
      </div>

      <Link
        to="/create-course"
        className="
        flex
        items-center
        gap-2
        rounded-lg
        text-black
        bg-blue-400
        px-5
        py-3
        font-medium
        hover:bg-blue-500
         transition-colors

      "
      >
        <Plus size={18} />
        Create new Course
      </Link>
    </div>
  );
};

export default ManageCourseTitle;
