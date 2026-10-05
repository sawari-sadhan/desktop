export const getModelValue = (model: any, fieldKey: string, fieldConfig: any) => {
  if (!model?.data) return undefined;
  
  if (model.data[fieldKey] !== undefined) {
    return model.data[fieldKey];
  }
  
  const specs = model.data.specifications;
  if (!specs) return undefined;
  
  const label = fieldConfig.label;
  if (label) {
    const cleanedLabel = label.toLowerCase();
    for (const k of Object.keys(specs)) {
      if (k.toLowerCase() === cleanedLabel) {
        return specs[k];
      }
    }
  }
  
  return undefined;
};

export const formatValue = (val: any) => {
  if (val === null || val === undefined) return undefined;
  if (typeof val === 'object') {
    if (val.value !== undefined) {
      return val.value;
    }
  }
  return val;
};

export const KEY_SPECS = {
  engine_type: { label: "Engine Type", type: "string" },
  displacement: { label: "Displacement", type: "number", unit: "cc" },
  max_power: { label: "Max Power", type: "string" },
  max_torque: { label: "Max Torque", type: "string" },
  transmission_type: { label: "Transmission Type", type: "string" },
  fuel_type: { label: "Fuel Type", type: "string" },
  seating_capacity: { label: "Seating Capacity", type: "number" },
  length: { label: "Length", type: "number", unit: "mm" },
  width: { label: "Width", type: "number", unit: "mm" },
  height: { label: "Height", type: "number", unit: "mm" },
  ground_clearance: { label: "Ground Clearance Unladen", type: "number", unit: "mm" }
};
