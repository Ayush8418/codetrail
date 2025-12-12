"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Heading from "@tiptap/extension-heading";
import ListItem from "@tiptap/extension-list-item";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";



import {
  Bold,
  Italic,
  List,
  Highlighter,
  Heading1,
  Heading3,
  Code,
  LinkIcon,
  UnderlineIcon,
  Maximize,
  Minimize
} from "lucide-react";

import { useEffect, useState } from "react";

export default function SessionNotes({
  onData,
  isExpanded,
  toggleExpand,
  initialTopic,
  initialDescription
}: {
  onData: (data: any) => void;
  isExpanded: boolean;
  toggleExpand: () => void;
  initialTopic: string | null;
  initialDescription: string | null;
}) {


  const [topic, setTopic] = useState(initialTopic || "");


  const editor = useEditor({
  extensions: [
    StarterKit.configure({
      bulletList: false,
      orderedList: false,
      listItem: false,
    }),

    // ✅ Proper list support (THIS FIXES EVERYTHING)
    BulletList,
    OrderedList,
    ListItem,

    // ✅ Formatting
    Highlight,
    Underline,
    Link.configure({ openOnClick: true }),

    // ✅ Headings
    Heading.configure({
      levels: [1, 2, 3],
    }),
  ],

  content: initialDescription || "<p>Start writing...</p>",

  immediatelyRender: false,
});

useEffect(() => {
  setTopic(initialTopic || "");
}, [initialTopic]);

  useEffect(() => {
    onData({ topic });
    }, [topic]);

  useEffect(() => {
    if (!editor) return;

    const handler = () => {
      onData({ description: editor.getHTML() });
    };

    editor.on("update", handler);

    return () => {
      editor.off("update", handler);
    };
  }, [editor]);


  const setLink = () => {
  if (editor?.isActive("link")) {
    editor.chain().focus().unsetLink().run();
    return;
  }

  const url = prompt("Enter link URL:");
  if (!url) return;

  editor!.chain().focus().setLink({ href: url }).run();
};

  return (
    <div className={`
      transition-all duration-300
      ${isExpanded ? "w-full" : "w-full lg:w-1/2"}
      flex flex-col justify-center items-center
    `}>
      
      {/* Topic Input + Expand Button */}
      <div className="flex w-full items-center justify-between mb-2">
        <input
          className="w-[90%] min-h-[50px] backdrop-blur-md bg-white/5 dark:bg-black/10 
                     rounded-2xl border border-white/10 p-4 shadow-md text-2xl font-bold"
          type="text"
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Topic:"
          value={topic}
        />

        {/* Expand Button */}
        <button
          onClick={toggleExpand}
          className="mr-[2%] p-3 rounded-xl bg-white/10 hover:bg-white/20 transition"
        >
          {isExpanded ? <Minimize size={22} /> : <Maximize size={22} />}
        </button>
      </div>

      {/* Editor Container */}
      <div className="relative w-full min-h-[300px] backdrop-blur-md bg-white/5 dark:bg-black/10 
                      rounded-2xl border-white/10 p-6 shadow-md border-2 flex flex-col">

        <div className="min-h-[450px] overflow-y-scroll hide-scroll p-1">
          <EditorContent editor={editor} className="tiptap text-black dark:text-white" />
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap justify-center gap-4 mt-4 pt-3 border-t border-white/10">

  {/* Bold */}
  <button
    onClick={() => editor?.chain().focus().toggleBold().run()}
    className={`btn ${editor?.isActive("bold") ? "active-btn" : ""}`}
  >
    <Bold size={18}/>
  </button>

  {/* Italic */}
  <button
    onClick={() => editor?.chain().focus().toggleItalic().run()}
    className={`btn ${editor?.isActive("italic") ? "active-btn" : ""}`}
  >
    <Italic size={18}/>
  </button>

  {/* Underline */}
  <button
    onClick={() => editor?.chain().focus().toggleUnderline().run()}
    className={`btn ${editor?.isActive("underline") ? "active-btn" : ""}`}
  >
    <UnderlineIcon size={18}/>
  </button>

  {/* Highlight */}
  <button
    onClick={() => editor?.chain().focus().toggleHighlight().run()}
    className={`btn ${editor?.isActive("highlight") ? "active-btn" : ""}`}
  >
    <Highlighter size={18}/>
  </button>

  {/* H1 */}
  <button
    onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
    className={`btn ${editor?.isActive("heading", { level: 1 }) ? "active-btn" : ""}`}
  >
    <Heading1 size={18}/>
  </button>

  {/* H3 */}
  <button
  onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
  className={`btn ${editor?.isActive("heading", { level: 3 }) ? "active-btn" : ""}`}
>
  <Heading3 size={18} />
</button>

  {/* List */}
  <button
    onClick={() => editor?.chain().focus().toggleBulletList().run()}
    className={`btn ${editor?.isActive("bulletList") ? "active-btn" : ""}`}
  >
    <List size={18}/>
  </button>

  {/* Code */}
  <button
    onClick={() => editor?.chain().focus().toggleCode().run()}
    className={`btn ${editor?.isActive("code") ? "active-btn" : ""}`}
  >
    <Code size={18}/>
  </button>

  {/* Link */}
  <button
    onClick={setLink}
    className={`btn ${editor?.isActive("link") ? "active-btn" : ""}`}
  >
    <LinkIcon size={18}/>
  </button>

</div>

        {/* Styles */}
        <style>{`
          .hide-scroll::-webkit-scrollbar { display: none; }
          .btn:hover { background: rgba(255,255,255,0.15); }
          .btn {
            padding: 6px;
            border-radius: 8px;
            transition: 0.15s;
            border: 1px solid transparent;
          }

          .btn:hover {
            background: rgba(255,255,255,0.12);
          }

          .active-btn {
            background: rgba(255,255,255,0.25);
            border: 1px solid rgba(255,255,255,0.4);
          }
          .tiptap h1 {
            font-size: 1.8rem;
            font-weight: bold;
            margin-top: 1rem;
          }
          .tiptap h3 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-top: .8rem;
          }
          .tiptap:focus {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
        }
          .tiptap ul {
  list-style-type: disc;
  padding-left: 1.5rem;
  margin-top: 0.5rem;
}

.tiptap li {
  margin: 0.3rem 0;
}
.tiptap a {
  color: #3b82f6; /* Tailwind blue-500 */
  text-decoration: underline;
  cursor: pointer;
  font-weight: 500;
}

.tiptap a:hover {
  color: #2563eb; /* Tailwind blue-600 */
}

        `}</style>

      </div>
    </div>
  );
}
