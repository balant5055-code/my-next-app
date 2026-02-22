"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function RichTextEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="border border-slate-600 rounded-xl bg-slate-800 overflow-hidden">
      {/* Toolbar */}
      <div className="flex gap-2 p-3 border-b border-slate-700 bg-slate-900">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="px-3 py-1 text-sm bg-slate-700 rounded hover:bg-slate-600"
        >
          Bold
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="px-3 py-1 text-sm bg-slate-700 rounded hover:bg-slate-600"
        >
          Italic
        </button>

        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className="px-3 py-1 text-sm bg-slate-700 rounded hover:bg-slate-600"
        >
          H2
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="px-3 py-1 text-sm bg-slate-700 rounded hover:bg-slate-600"
        >
          Bullet
        </button>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="p-4 min-h-[200px] text-white focus:outline-none"
      />
    </div>
  );
}
