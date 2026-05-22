"use client";

import React from "react";
import { StringEditor } from "./StringEditor";
import { NumberEditor } from "./NumberEditor";
import { BooleanEditor } from "./BooleanEditor";
import { NodeType } from "@lib/core";
import { AlertCircle } from "lucide-react";

interface AttributeEditorProps {
  attribute: NodeType;
}

export const AttributeEditor = ({ attribute }: AttributeEditorProps) => {
  const rawType = (attribute.dataTypes as any)?.type || "string";
  const type = Array.isArray(rawType)
    ? (rawType.includes("string") ? "string" : (rawType[0] || "string"))
    : rawType;
  const unit = (attribute.dataTypes as any)?.units || (attribute.dataTypes as any)?.unit;

  const renderEditor = () => {
    switch (type) {
      case "string":
        return <StringEditor attributeCode={attribute.code} name={attribute.name} />;
      case "number":
        return (
          <NumberEditor 
            attributeCode={attribute.code} 
            name={attribute.name} 
            unit={unit} 
          />
        );
      case "boolean":
        return <BooleanEditor attributeCode={attribute.code} name={attribute.name} />;
      default:
        return (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-[2.5rem] p-10 flex flex-col items-center gap-4">
            <AlertCircle className="w-10 h-10 text-amber-500/50" />
            <p className="text-sm font-bold text-amber-200 uppercase tracking-widest text-center">
              Unsupported Data Type: {type}
            </p>
            <p className="text-xs text-amber-200/50 text-center max-w-xs">
              This attribute uses a complex or custom data type that does not have a standard editor implementation yet.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      {renderEditor()}
    </div>
  );
};
