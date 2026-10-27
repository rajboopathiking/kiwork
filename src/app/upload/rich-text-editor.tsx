import {
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
  Redo2,
} from "lucide-react";
import { EditorContent, useEditor, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapLink from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";

export default function RichTextEditor({
  onChange,
}: {
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false,
        underline: false,
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TiptapLink.configure({ openOnClick: false, autolink: true }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none min-h-[280px] px-3 py-2 outline-none rounded-b-lg focus:outline-none",
      },
    },
    onUpdate({ editor }: { editor: Editor }) {
      onChange(editor.getHTML());
    },
  });

  const btn =
    "flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900";
  const btnActive = "flex h-8 w-8 items-center justify-center rounded-md bg-emerald-100 text-emerald-800";

  if (!editor) {
    return (
      <div className="min-h-[320px] animate-pulse rounded-lg border border-slate-300 bg-slate-50" />
    );
  }

  return (
    <div className="rounded-lg border border-slate-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
      <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? btnActive : btn}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? btnActive : btn}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? btnActive : btn}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? btnActive : btn}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </button>

        <span className="mx-1 w-px self-stretch bg-slate-200" />

        {[1, 2, 3].map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run()}
            className={
              editor.isActive("heading", { level }) ? btnActive : `${btn} font-bold`
            }
            title={`Heading ${level}`}
          >
            <span className="text-xs font-semibold">H{level}</span>
          </button>
        ))}

        <span className="mx-1 w-px self-stretch bg-slate-200" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? btnActive : btn}
          title="Bullet list"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? btnActive : btn}
          title="Numbered list"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? btnActive : btn}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </button>

        <span className="mx-1 w-px self-stretch bg-slate-200" />

        <button
          type="button"
          onClick={() => {
            const url = window.prompt("Paste a link:");
            if (url) editor.chain().focus().setLink({ href: url }).run();
            else editor.chain().focus().unsetLink().run();
          }}
          className={editor.isActive("link") ? btnActive : btn}
          title="Insert link"
        >
          <Link2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetLink().run()}
          className={btn}
          title="Remove link"
        >
          <Link2 className="h-4 w-4 opacity-40" />
        </button>

        <span className="mx-1 w-px self-stretch bg-slate-200" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className={btn}
          title="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className={btn}
          title="Redo"
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
