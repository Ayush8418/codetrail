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
  } from "lucide-react";

  import { useEffect, useState } from "react";

  export default function SessionNotes({
  onData,
  initialTopic,
  initialDescription,
  showTopic = true,
  mode = "default", // 👈 NEW
}: {
  onData: (data: any) => void;
  initialTopic: string | null;
  initialDescription: string | null;
  showTopic?: boolean;
  mode?: "default" | "diary"; // 👈 NEW
}) {

    const [topic, setTopic] = useState(initialTopic || "");
    
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          bulletList: false,
          orderedList: false,
          listItem: false,
        }),
        BulletList,
        OrderedList,
        ListItem,
        Highlight,
        Underline,
        Link.configure({ openOnClick: true }),
        Heading.configure({ levels: [1, 2, 3] }),
      ],
      content: initialDescription || "<p>Start writing...</p>",
      immediatelyRender: false,
    });

    useEffect(() => {
      setTopic(initialTopic || "");
      console.log(mode);
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
      return () => {editor.off("update", handler)};
    }, [editor]);

    const setLink = () => {
      if (editor?.isActive("link")) {
        editor.chain().focus().unsetLink().run();
        return;
      }
      const url = prompt("Enter link URL:");
      if (url) editor?.chain().focus().setLink({ href: url }).run();
    };

    return (
      <div className="w-full space-y-4">
        {/* ================= TOPIC (OPTIONAL) ================= */}
        {showTopic && (
          <div>
            <label className="block text-xs mb-1 text-zinc-500">
              Topic
            </label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Topic"
              className="
                w-full bg-white dark:bg-black rounded-lg
                text-2xl font-bold
                text-zinc-900 dark:text-zinc-100
                border-b border-zinc-400 dark:border-zinc-700
                focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100
                p-2
              "
            />
          </div>
        )}

        {/* ================= EDITOR ================= */}
        <div
          className="
            relative w-full
            rounded-2xl
            backdrop-blur-md
            bg-white/70 dark:bg-zinc-900/60
            border border-zinc-300/50 dark:border-zinc-700/50
            p-5
          "
        >
          <div className="min-h-[320px] max-h-[500px] overflow-y-auto hide-scroll">
            <EditorContent
              editor={editor}
              className="tiptap text-zinc-900 dark:text-zinc-100"
            />
          </div>

          {/* ================= TOOLBAR ================= */}
          <div
            className="
              mt-4 pt-3
              flex flex-wrap justify-center gap-2
              border-t border-zinc-300/50 dark:border-zinc-700/50
            "
          >
            <ToolbarButton
              active={editor?.isActive("bold")}
              onClick={() => editor?.chain().focus().toggleBold().run()}
            >
              <Bold size={16} />
            </ToolbarButton>

            <ToolbarButton
              active={editor?.isActive("italic")}
              onClick={() => editor?.chain().focus().toggleItalic().run()}
            >
              <Italic size={16} />
            </ToolbarButton>

            <ToolbarButton
              active={editor?.isActive("underline")}
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
            >
              <UnderlineIcon size={16} />
            </ToolbarButton>

            <ToolbarButton
              active={editor?.isActive("highlight")}
              onClick={() => editor?.chain().focus().toggleHighlight().run()}
            >
              <Highlighter size={16} />
            </ToolbarButton>

            <ToolbarButton
              active={editor?.isActive("heading", { level: 1 })}
              onClick={() =>
                editor?.chain().focus().toggleHeading({ level: 1 }).run()
              }
            >
              <Heading1 size={16} />
            </ToolbarButton>

            <ToolbarButton
              active={editor?.isActive("heading", { level: 3 })}
              onClick={() =>
                editor?.chain().focus().toggleHeading({ level: 3 }).run()
              }
            >
              <Heading3 size={16} />
            </ToolbarButton>

            <ToolbarButton
              active={editor?.isActive("bulletList")}
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
            >
              <List size={16} />
            </ToolbarButton>

            <ToolbarButton
              active={editor?.isActive("code")}
              onClick={() => editor?.chain().focus().toggleCode().run()}
            >
              <Code size={16} />
            </ToolbarButton>

            <ToolbarButton
              active={editor?.isActive("link")}
              onClick={setLink}
            >
              <LinkIcon size={16} />
            </ToolbarButton>
          </div>
        </div>

        {/* ================= STYLES ================= */}
        <style>{`
          .hide-scroll::-webkit-scrollbar { display: none; }

          .tiptap:focus {
            outline: none;
          }

          .tiptap h1 {
            font-size: 1.8rem;
            font-weight: 700;
            margin-top: 1rem;
          }

          .tiptap h3 {
            font-size: 1.4rem;
            font-weight: 600;
            margin-top: .75rem;
          }

          .tiptap ul {
            list-style: disc;
            padding-left: 1.5rem;
            margin-top: 0.5rem;
          }

          .tiptap li {
            margin: 0.25rem 0;
          }

          .tiptap a {
            text-decoration: underline;
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  }

  /* ================= TOOLBAR BUTTON ================= */

  function ToolbarButton({
    active,
    onClick,
    children,
  }: {
    active?: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) {
    return (
      <button
        onClick={onClick}
        className={`
          p-2 rounded-lg
          border
          transition
          ${
            active
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900"
              : "bg-transparent text-zinc-700 dark:text-zinc-300 border-transparent hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60"
          }
        `}
      >
        {children}
      </button>
    );
  }
