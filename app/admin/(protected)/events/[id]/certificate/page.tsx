"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Rnd } from "react-rnd";

type Field = {
  id: string;
  key: string;
  label: string;

  x: number;
  y: number;
  width: number;
  height: number;

  fontSize: number;
  color: string;

  fontWeight: "normal" | "bold";
  textAlign: "left" | "center" | "right";
  locked: boolean;
};

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 850;

export default function CertificateDesigner() {
  const params = useParams();
  const eventId = params?.id as string;

  const [template, setTemplate] = useState<string | null>(null);
  const [templateFile, setTemplateFile] = useState<File | null>(null);

  const [fields, setFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  /* ---------------- FIELD LIBRARY ---------------- */

  const fieldLibrary = [
    { key: "name", label: "Participant Name" },
    { key: "bibNumber", label: "Bib Number" },
    { key: "finishTime", label: "Finish Time" },
    { key: "rank", label: "Rank" },
    { key: "category", label: "Category" },
  ];

  const previewData: any = {
    name: "Bala NT",
    bibNumber: "1023",
    finishTime: "00:32:23",
    rank: "1",
    category: "Men Open",
  };

  /* ---------------- TEMPLATE UPLOAD ---------------- */

  const handleTemplateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setTemplateFile(file);

    const preview = URL.createObjectURL(file);
    setTemplate(preview);
  };

  /* ---------------- ADD FIELD ---------------- */

  const addField = (field: any) => {
    const newField: Field = {
      id: crypto.randomUUID(),
      key: field.key,
      label: field.label,

      x: 400,
      y: 400,
      width: 260,
      height: 50,

      fontSize: 25,
      color: "#000000",

      fontWeight: "bold",
      textAlign: "center",
      locked: false,
    };

    setFields((prev) => [...prev, newField]);
  };

  /* ---------------- DELETE FIELD ---------------- */

  const deleteField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    setSelectedField(null);
  };

  /* ---------------- UPDATE FIELD ---------------- */

  const updateField = (id: string, key: string, value: any) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [key]: value } : f)),
    );
  };

  /* ---------------- LOAD EXISTING TEMPLATE ---------------- */

  useEffect(() => {
    if (!eventId) return;

    const loadLayout = async () => {
      const res = await fetch(`/api/admin/events/${eventId}`);
      const data = await res.json();

      if (data?.certificateTemplate) {
        setTemplate(data.certificateTemplate.templateUrl);
        setFields(data.certificateTemplate.fields || []);
      }
    };

    loadLayout();
  }, [eventId]);

  /* ---------------- SAVE LAYOUT ---------------- */

  const saveLayout = async () => {
    setLoading(true);

    try {
      const formData = new FormData();

      if (templateFile) {
        formData.append("file", templateFile);
      }

      formData.append(
        "layout",
        JSON.stringify({
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          fields,
        }),
      );

      const res = await fetch(`/api/admin/events/${eventId}/certificate`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        if (data.templateUrl) {
          setTemplate(data.templateUrl);
        }

        alert("Certificate layout saved");
      } else {
        alert("Save failed");
      }
    } catch (err) {
      console.error(err);
      alert("Save failed");
    }

    setLoading(false);
  };

  const selected = fields.find((f) => f.id === selectedField);

  /* ---------------- UI ---------------- */

  return (
    <div className="flex gap-6 p-6">
      {/* LEFT PANEL */}

      <div className="w-72 space-y-6">
        {/* FIELD LIBRARY */}

        <div>
          <div className="text-lg font-semibold mb-3">Field Library</div>

          <div className="space-y-2">
            {fieldLibrary.map((field) => (
              <button
                key={field.key}
                onClick={() => addField(field)}
                className="w-full bg-slate-800 hover:bg-indigo-600 text-white p-2 rounded text-sm"
              >
                + {field.label}
              </button>
            ))}
          </div>
        </div>

        {/* TEMPLATE UPLOAD */}

        <div className="border-t pt-4 space-y-2">
          <div className="text-sm font-semibold">
            Upload Certificate Template
          </div>

          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleTemplateSelect}
          />
        </div>

        {/* FIELD SETTINGS */}

        {selected && (
          <div className="border-t pt-4 space-y-3">
            <div className="font-semibold text-sm">Field Settings</div>

            <div className="text-xs text-gray-500">{selected.label}</div>

            <div className="flex gap-2">
              <input
                type="number"
                value={selected.fontSize}
                className="w-20 border p-1"
                onChange={(e) =>
                  updateField(selected.id, "fontSize", parseInt(e.target.value))
                }
              />

              <input
                type="color"
                value={selected.color}
                onChange={(e) =>
                  updateField(selected.id, "color", e.target.value)
                }
              />
            </div>

            <select
              value={selected.textAlign}
              className="w-full border p-1"
              onChange={(e) =>
                updateField(selected.id, "textAlign", e.target.value)
              }
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.fontWeight === "bold"}
                onChange={(e) =>
                  updateField(
                    selected.id,
                    "fontWeight",
                    e.target.checked ? "bold" : "normal",
                  )
                }
              />
              Bold
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.locked}
                onChange={(e) =>
                  updateField(selected.id, "locked", e.target.checked)
                }
              />
              Lock position
            </label>

            <button
              onClick={() => deleteField(selected.id)}
              className="text-red-500 text-sm"
            >
              Delete Field
            </button>
          </div>
        )}
      </div>

      {/* CANVAS */}

      <div className="flex-1 overflow-auto">
        <div
          className="relative border bg-white shadow"
          style={{
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
          }}
        >
          {template && (
            <img
              src={template}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {fields.map((field) => {
            const value = previewData[field.key] || field.label;

            return (
              <Rnd
                key={field.id}
                size={{
                  width: field.width,
                  height: field.height,
                }}
                position={{
                  x: field.x,
                  y: field.y,
                }}
                disableDragging={field.locked}
                enableResizing={!field.locked}
                onDragStop={(e, d) => {
                  updateField(field.id, "x", d.x);
                  updateField(field.id, "y", d.y);
                }}
                onResizeStop={(e, dir, ref, delta, pos) => {
                  updateField(field.id, "width", parseInt(ref.style.width));

                  updateField(field.id, "height", parseInt(ref.style.height));

                  updateField(field.id, "x", pos.x);
                  updateField(field.id, "y", pos.y);
                }}
                onClick={() => setSelectedField(field.id)}
              >
                <div
                  style={{
                    fontSize: field.fontSize,
                    color: field.color,
                    fontWeight: field.fontWeight,
                    textAlign: field.textAlign,
                  }}
                  className="w-full h-full flex items-center justify-center border border-dashed cursor-move bg-white/60"
                >
                  {value}
                </div>
              </Rnd>
            );
          })}
        </div>
      </div>

      {/* SAVE BUTTON */}

      <div className="fixed bottom-8 right-8">
        <button
          onClick={saveLayout}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-lg"
        >
          {loading ? "Saving..." : "Save Layout"}
        </button>
      </div>
    </div>
  );
}
