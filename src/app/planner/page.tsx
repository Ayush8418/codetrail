import DiaryEntry from "@/components/DiaryEntry";
import HabitTracker from "@/components/HabitTracker"
import Todo from "@/components/Todo";

export default function PlannerPage() {
  return (
    <div className="">
      <div className="flex flex-col lg:flex-row gap-10 mx-4 items-start mt-10">
        <div className="w-full lg:w-[340px] shrink-0">
          <Todo />
        </div>
        
        <div className="flex-1 w-full">
          <DiaryEntry />
        </div>

      </div>

      
      <HabitTracker/>


      <h1>fghjk</h1>
    </div>
  );
}
