"use client";

import { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import ImageExt from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  LinkIcon,
  ImageIcon,
  Loader2,
} from "lucide-react";

// Trình soạn thảo bài viết dùng chung cho Sản phẩm (mô tả) và Blog (nội dung bài viết) — hỗ trợ
// H2/H3/đoạn văn, danh sách, trích dẫn, liên kết và chèn ảnh xen giữa nội dung (chuẩn SEO).
export default function RichTextEditor({
  name,
  defaultValue = "",
  uploadSubdir = "blog",
}: {
  name: string;
  defaultValue?: string;
  uploadSubdir?: string;
}) {
  const [html, setHtml] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false }),
      ImageExt,
      Placeholder.configure({ placeholder: "Viết nội dung tại đây... dùng thanh công cụ để chèn H2, H3, ảnh." }),
    ],
    content: defaultValue,
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose-bridal min-h-[280px] focus:outline-none px-4 py-4",
      },
    },
  });

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("subdir", uploadSubdir);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (res.ok && editor) {
        editor.chain().focus().setImage({ src: json.url, alt: "" }).run();
      }
    } finally {
      setUploading(false);
    }
  };

  if (!editor) return null;

  const Btn = ({
    onClick,
    active,
    children,
    title,
  }: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`w-8 h-8 flex items-center justify-center border ${
        active ? "bg-neutral-900 text-white border-neutral-900" : "border-transparent hover:border-neutral-300"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-neutral-300">
      <input type="hidden" name={name} value={html} />
      <div className="flex flex-wrap items-center gap-1 border-b border-neutral-200 p-2 bg-neutral-50">
        <Btn title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="w-4 h-4" />
        </Btn>
        <Btn title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="w-4 h-4" />
        </Btn>
        <Btn title="Đậm" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <BoldIcon className="w-4 h-4" />
        </Btn>
        <Btn title="Nghiêng" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <ItalicIcon className="w-4 h-4" />
        </Btn>
        <Btn title="Gạch chân" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="w-4 h-4" />
        </Btn>
        <Btn title="Danh sách" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="w-4 h-4" />
        </Btn>
        <Btn title="Danh sách số" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="w-4 h-4" />
        </Btn>
        <Btn title="Trích dẫn" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="w-4 h-4" />
        </Btn>
        <Btn
          title="Liên kết"
          active={editor.isActive("link")}
          onClick={() => {
            const url = window.prompt("Nhập URL liên kết:");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
        >
          <LinkIcon className="w-4 h-4" />
        </Btn>
        <Btn title="Chèn ảnh" onClick={() => fileRef.current?.click()}>
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
        </Btn>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadImage(f);
          }}
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
