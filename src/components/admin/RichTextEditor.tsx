'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapImage from '@tiptap/extension-image';
import TiptapLink from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import { Extension } from '@tiptap/core';
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Heading2, Link2, Unlink, Image, Undo, Redo, Palette, Type, ALargeSmall, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useState, useRef, useEffect } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

// Custom font-size extension – adds fontSize attribute to the textStyle mark
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() { return { types: ['textStyle'] }; },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        fontSize: {
          default: null,
          parseHTML: (el: HTMLElement) => el.style.fontSize || null,
          renderHTML: (attrs: Record<string, unknown>) => {
            if (!attrs.fontSize) return {};
            return { style: `font-size: ${attrs.fontSize}` };
          },
        },
      },
    }];
  },
});

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const COLORS = [
  '#000000', '#374151', '#6B7280', '#991B1B', '#DC2626', '#EA580C',
  '#D97706', '#65A30D', '#16A34A', '#0891B2', '#2563EB', '#7C3AED',
  '#C026D3', '#DB2777', '#FFFFFF',
];

const FONTS = [
  { value: '', label: 'Default' },
  // System fonts
  { value: 'Arial', label: 'Arial' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Trebuchet MS', label: 'Trebuchet MS' },
  { value: 'Tahoma', label: 'Tahoma' },
  { value: 'Impact', label: 'Impact' },
  // Google Fonts – Serif
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Lora', label: 'Lora' },
  { value: 'Merriweather', label: 'Merriweather' },
  { value: 'PT Serif', label: 'PT Serif' },
  { value: 'Roboto Slab', label: 'Roboto Slab' },
  { value: 'Cormorant Garamond', label: 'Cormorant Garamond' },
  { value: 'Cinzel', label: 'Cinzel' },
  { value: 'Abril Fatface', label: 'Abril Fatface' },
  // Google Fonts – Sans-serif
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Raleway', label: 'Raleway' },
  { value: 'Oswald', label: 'Oswald' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Nunito', label: 'Nunito' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Quicksand', label: 'Quicksand' },
  { value: 'Bebas Neue', label: 'Bebas Neue' },
  { value: 'Josefin Sans', label: 'Josefin Sans' },
  // Google Fonts – Display / Script
  { value: 'Dancing Script', label: 'Dancing Script' },
  { value: 'Pacifico', label: 'Pacifico' },
  { value: 'Caveat', label: 'Caveat' },
  { value: 'Satisfy', label: 'Satisfy' },
];

const FONT_SIZES = [
  { value: '', label: 'Default' },
  { value: '10px', label: '10' },
  { value: '12px', label: '12' },
  { value: '14px', label: '14' },
  { value: '16px', label: '16' },
  { value: '18px', label: '18' },
  { value: '20px', label: '20' },
  { value: '24px', label: '24' },
  { value: '28px', label: '28' },
  { value: '32px', label: '32' },
  { value: '36px', label: '36' },
  { value: '48px', label: '48' },
  { value: '64px', label: '64' },
];

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const colorRef = useRef<HTMLDivElement>(null);
  const fontRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapImage,
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      Underline,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none',
      },
    },
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (colorRef.current && !colorRef.current.contains(e.target as Node)) setShowColorPicker(false);
      if (fontRef.current && !fontRef.current.contains(e.target as Node)) setShowFontPicker(false);
      if (sizeRef.current && !sizeRef.current.contains(e.target as Node)) setShowSizePicker(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!editor) return null;

  const ToolbarButton = ({ onClick, active, children, label }: { onClick: () => void; active?: boolean; children: React.ReactNode; label: string }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'p-1.5 rounded hover:bg-earth-100 transition-colors',
        active && 'bg-earth-200 text-gamosa-600'
      )}
      aria-label={label}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-earth-300 rounded-lg overflow-hidden bg-white">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-earth-200 bg-earth-50">
        {/* Font family */}
        <div className="relative" ref={fontRef}>
          <button
            type="button"
            onClick={() => setShowFontPicker(!showFontPicker)}
            className={cn('p-1.5 rounded hover:bg-earth-100 transition-colors flex items-center gap-1', showFontPicker && 'bg-earth-200')}
            aria-label="Font style"
          >
            <Type className="h-4 w-4" />
            <svg className="h-3 w-3 text-earth-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {showFontPicker && (
            <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-earth-200 rounded-lg shadow-lg py-1 min-w-[180px] max-h-[240px] overflow-y-auto">
              {FONTS.map(font => (
                <button
                  key={font.value}
                  type="button"
                  onClick={() => {
                    if (font.value) {
                      editor.chain().focus().setFontFamily(font.value).run();
                    } else {
                      editor.chain().focus().unsetFontFamily().run();
                    }
                    setShowFontPicker(false);
                  }}
                  className="block w-full text-left px-3 py-1.5 text-sm hover:bg-earth-50 transition-colors"
                  style={{ fontFamily: font.value || 'inherit' }}
                >
                  {font.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Font size */}
        <div className="relative" ref={sizeRef}>
          <button
            type="button"
            onClick={() => setShowSizePicker(!showSizePicker)}
            className={cn('p-1.5 rounded hover:bg-earth-100 transition-colors flex items-center gap-1', showSizePicker && 'bg-earth-200')}
            aria-label="Font size"
          >
            <ALargeSmall className="h-4 w-4" />
            <svg className="h-3 w-3 text-earth-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {showSizePicker && (
            <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-earth-200 rounded-lg shadow-lg py-1 min-w-[100px] max-h-[240px] overflow-y-auto">
              {FONT_SIZES.map(size => (
                <button
                  key={size.value || '_default'}
                  type="button"
                  onClick={() => {
                    if (size.value) {
                      editor.chain().focus().setMark('textStyle', { fontSize: size.value }).run();
                    } else {
                      editor.chain().focus().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run();
                    }
                    setShowSizePicker(false);
                  }}
                  className="block w-full text-left px-3 py-1.5 text-sm hover:bg-earth-50 transition-colors"
                  style={{ fontSize: size.value || 'inherit' }}
                >
                  {size.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="w-px h-5 bg-earth-300 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} label="Bold">
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} label="Italic">
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} label="Underline">
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <div className="w-px h-5 bg-earth-300 mx-1" />
        {/* Color picker */}
        <div className="relative" ref={colorRef}>
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className={cn('p-1.5 rounded hover:bg-earth-100 transition-colors', showColorPicker && 'bg-earth-200')}
            aria-label="Text color"
          >
            <Palette className="h-4 w-4" />
          </button>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-earth-200 rounded-lg shadow-lg p-2 grid grid-cols-5 gap-1 min-w-[140px]">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    editor.chain().focus().setColor(color).run();
                    setShowColorPicker(false);
                  }}
                  className="w-6 h-6 rounded border border-earth-200 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  aria-label={`Color ${color}`}
                />
              ))}
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().unsetColor().run();
                  setShowColorPicker(false);
                }}
                className="col-span-5 text-xs text-earth-500 hover:text-earth-700 py-1 mt-1 border-t border-earth-100"
              >
                Remove color
              </button>
            </div>
          )}
        </div>
        <div className="w-px h-5 bg-earth-300 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} label="Heading">
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} label="Bullet list">
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} label="Numbered list">
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <div className="w-px h-5 bg-earth-300 mx-1" />
        <ToolbarButton onClick={() => {
          if (editor.isActive('link')) {
            editor.chain().focus().unsetLink().run();
          } else {
            const url = window.prompt('Enter URL:');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }
        }} active={editor.isActive('link')} label="Link">
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()} label="Remove link">
          <Unlink className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => {
          const url = window.prompt('Enter image URL:');
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }} label="Image">
          <Image className="h-4 w-4" />
        </ToolbarButton>
        <div className="w-px h-5 bg-earth-300 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} label="Undo">
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} label="Redo">
          <Redo className="h-4 w-4" />
        </ToolbarButton>
        <div className="w-px h-5 bg-earth-300 mx-1" />
        <ToolbarButton onClick={() => setShowResetConfirm(true)} label="Reset content">
          <RotateCcw className="h-4 w-4" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={() => {
          // Strip all formatting but keep the text
          editor.chain()
            .selectAll()
            .unsetAllMarks()
            .clearNodes()
            .run();
          onChange(editor.getHTML());
          setShowResetConfirm(false);
        }}
        title="Reset Formatting"
        message="Are you sure you want to remove all formatting (bold, color, font, links, etc.)? The text content will be kept."
        confirmLabel="Reset Formatting"
        confirmVariant="danger"
      />
    </div>
  );
}
