"use client";

import { useMemo } from "react";
import { SingleValue } from "react-select";
import CreatableSelect from "react-select/creatable";

type SelectProps = {
  onChange: (value?: string) => void;
  onCreate?: (value: string) => void;
  options?: { label: string; value: string }[];
  value?: string | null;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
};

export const Select = ({
  onChange,
  onCreate,
  options = [],
  value,
  disabled,
  placeholder,
  isLoading,
}: SelectProps) => {
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );

  const selectHandler = (
    option: SingleValue<{ label: string; value: string }>
  ) => {
    if (option) {
      onChange(option.value);
    } else {
      onChange(undefined);
    }
  };

  const createHandler = (inputValue: string) => {
    onCreate?.(inputValue);
  };

  return (
    <CreatableSelect
      isDisabled={disabled}
      isLoading={isLoading}
      value={selectedOption}
      onChange={selectHandler}
      onCreateOption={createHandler}
      options={options}
      placeholder={placeholder}
      className="text-sm h-10"
      styles={{
        control: (base) => ({
          ...base,
          borderColor: "#e2e7f0",
          ":hover": {
            ...base[":hover"],
            borderColor: "#e2e7f0",
          },
        }),
      }}
    />
  );
};
