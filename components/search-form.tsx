import React, { useState, useCallback } from "react";
import { Card, CardBody } from "@heroui/card";
import {
  Button,
  Input,
  CheckboxGroup,
  Checkbox,
  Divider,
  Tooltip,
  Chip,
  Form,
} from "@heroui/react";
import { motion } from "framer-motion";

interface SearchFormProps {
  onSubmit: (kelas: string, selectedOptions: string[]) => void;
  isLoading: boolean;
}

export default function SearchForm({ onSubmit, isLoading }: SearchFormProps) {
  const [kelas, setKelas] = useState<string>("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const handleKelasChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setKelas(e.target.value);
      if (validationErrors.kelas) {
        setValidationErrors((prev) => ({ ...prev, kelas: "" }));
      }
    },
    [validationErrors],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const errors: Record<string, string> = {};
      if (!kelas.trim()) {
        errors.kelas = "Masukkan kata kunci pencarian";
      }
      if (selectedOptions.length === 0) {
        errors.options = "Pilih minimal satu kategori pencarian";
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }

      setValidationErrors({});
      onSubmit(kelas, selectedOptions);
    },
    [kelas, selectedOptions, onSubmit],
  );

  const handleOptionsChange = useCallback(
    (values: string[]) => {
      if (values.includes("kelasBaru") && values.includes("mahasiswaBaru")) {
        const newOption = values.includes("kelasBaru")
          ? "mahasiswaBaru"
          : "kelasBaru";
        const filteredValues = values.filter(
          (v) =>
            v !== (newOption === "kelasBaru" ? "mahasiswaBaru" : "kelasBaru"),
        );
        setSelectedOptions(filteredValues);
      } else {
        setSelectedOptions(values);
      }
      if (validationErrors.options) {
        setValidationErrors((prev) => ({ ...prev, options: "" }));
      }
    },
    [validationErrors],
  );

  const handleClear = useCallback(() => {
    setKelas("");
  }, []);

  return (
    <div className="search-form-container w-full">
      <Card className="w-full overflow-hidden border border-zinc-200/20 bg-white/90 shadow-lg backdrop-blur-sm dark:border-zinc-700/30 dark:bg-zinc-900/90">
        <CardBody className="p-0">
          <div className="flex w-full justify-end border-b border-zinc-200/30 p-4 dark:border-zinc-700/30">
            <Button
              size="sm"
              variant="flat"
              className="w-24 bg-zinc-100/50 text-zinc-800 hover:bg-zinc-200/60 dark:bg-zinc-800/50 dark:text-zinc-200 dark:hover:bg-zinc-700/60"
              onClick={handleClear}
            >
              Reset
            </Button>
          </div>

          <Form
            onSubmit={handleSubmit}
            validationErrors={validationErrors}
            className="w-full"
            aria-label="Search Form"
            validationBehavior="aria"
          >
            <div className="w-full space-y-6 p-4 sm:p-6">
              <Input
                type="search"
                label="Kata Kunci Pencarian"
                placeholder="NPM, nama, atau kode kelas (contoh: 2IA14)"
                value={kelas}
                onChange={handleKelasChange}
                onClear={handleClear}
                name="kelas"
                id="search-input"
                isRequired
                isClearable
                autoComplete="off"
                errorMessage={validationErrors.kelas}
                isInvalid={!!validationErrors.kelas}
                variant="bordered"
                radius="lg"
                description="Mencari berdasarkan NPM, nama, atau kode kelas"
                fullWidth
                startContent={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 flex-shrink-0 text-purple-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </svg>
                }
                classNames={{
                  base: "w-full",
                  mainWrapper: "w-full",
                  inputWrapper: [
                    "w-full",
                    "bg-white/30 dark:bg-zinc-800/30",
                    "border-zinc-200/50 dark:border-zinc-700/50",
                    "hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50",
                    "group-data-[focused=true]:bg-white dark:group-data-[focused=true]:bg-zinc-800/80",
                    "group-data-[focused=true]:ring-2 ring-purple-500/30",
                    "!cursor-text",
                    "transition-all duration-200",
                  ],
                  input: [
                    "w-full",
                    "text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-500 dark:placeholder:text-zinc-500 text-sm sm:text-base",
                  ],
                  innerWrapper: "flex w-full gap-2",
                  label:
                    "text-zinc-700 dark:text-zinc-300 font-medium text-sm sm:text-base",
                  description: "text-zinc-500 text-xs sm:text-sm mt-1",
                  clearButton: "text-zinc-500 hover:text-purple-400",
                  errorMessage: "text-danger text-xs sm:text-sm mt-1",
                  helperWrapper: "flex flex-col mt-1.5 w-full",
                }}
              />

              <div className="rounded-lg bg-zinc-100/50 p-3 dark:bg-zinc-800/30 sm:p-4">
                <div className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400 sm:text-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>
                    Kamu juga bisa mencari berdasarkan nama dan NPM untuk
                    mahasiswa, atau nama dosen untuk jadwal
                  </span>
                </div>
              </div>

              <Divider className="my-2 bg-zinc-200/50 dark:bg-zinc-700/50" />

              <div className="w-full space-y-3">
                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 sm:text-base">
                    Pilih Kategori Pencarian
                  </h4>
                  {validationErrors.options && (
                    <Chip color="danger" size="sm" variant="flat" radius="lg">
                      {validationErrors.options}
                    </Chip>
                  )}
                </div>
                <CheckboxGroup
                  orientation="horizontal"
                  value={selectedOptions}
                  onValueChange={handleOptionsChange}
                  name="searchOptions"
                  aria-label="Opsi pencarian"
                  classNames={{
                    wrapper:
                      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 w-full",
                  }}
                  isRequired
                  errorMessage={validationErrors.options}
                  isInvalid={!!validationErrors.options}
                  color="secondary"
                >
                  <Tooltip content="Lihat jadwal perkuliahan" placement="top">
                    <Checkbox
                      value="jadwal"
                      classNames={{
                        base: "inline-flex max-w-full bg-white/50 dark:bg-zinc-800/50 rounded-lg data-[selected=true]:bg-purple-50 dark:data-[selected=true]:bg-purple-950/30 p-2.5 transition-all data-[selected=true]:border-purple-300 dark:data-[selected=true]:border-purple-700 border border-zinc-200/50 dark:border-zinc-700/50",
                        label: "text-zinc-700 dark:text-zinc-300 font-medium",
                        wrapper: "h-4 w-4",
                      }}
                      size="sm"
                      color="secondary"
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-purple-500"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            x="3"
                            y="4"
                            width="18"
                            height="18"
                            rx="2"
                            ry="2"
                          ></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        Jadwal Kelas
                      </div>
                    </Checkbox>
                  </Tooltip>

                  <Tooltip content="Informasi kelas baru" placement="top">
                    <Checkbox
                      value="kelasBaru"
                      isDisabled={selectedOptions.includes("mahasiswaBaru")}
                      classNames={{
                        base: "inline-flex max-w-full bg-white/50 dark:bg-zinc-800/50 rounded-lg data-[selected=true]:bg-purple-50 dark:data-[selected=true]:bg-purple-950/30 p-2.5 data-[disabled=true]:opacity-50 transition-all data-[selected=true]:border-purple-300 dark:data-[selected=true]:border-purple-700 border border-zinc-200/50 dark:border-zinc-700/50",
                        label: "text-zinc-700 dark:text-zinc-300 font-medium",
                        wrapper: "h-4 w-4",
                      }}
                      size="sm"
                      color="secondary"
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-purple-500"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        Kelas Baru
                      </div>
                    </Checkbox>
                  </Tooltip>

                  <Tooltip content="Informasi mahasiswa baru" placement="top">
                    <Checkbox
                      value="mahasiswaBaru"
                      isDisabled={selectedOptions.includes("kelasBaru")}
                      classNames={{
                        base: "inline-flex max-w-full bg-white/50 dark:bg-zinc-800/50 rounded-lg data-[selected=true]:bg-purple-50 dark:data-[selected=true]:bg-purple-950/30 p-2.5 data-[disabled=true]:opacity-50 transition-all data-[selected=true]:border-purple-300 dark:data-[selected=true]:border-purple-700 border border-zinc-200/50 dark:border-zinc-700/50",
                        label: "text-zinc-700 dark:text-zinc-300 font-medium",
                        wrapper: "h-4 w-4",
                      }}
                      size="sm"
                      color="secondary"
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-purple-500"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Mahasiswa Baru
                      </div>
                    </Checkbox>
                  </Tooltip>
                </CheckboxGroup>
              </div>

              <div className="border-t border-zinc-200/30 pt-4 dark:border-zinc-700/30">
                <Button
                  type="submit"
                  color="secondary"
                  isLoading={isLoading}
                  isDisabled={!kelas.trim() || selectedOptions.length === 0}
                  radius="lg"
                  variant="shadow"
                  className="w-full text-sm font-medium sm:text-base"
                  size="lg"
                  startContent={
                    !isLoading && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.3-4.3"></path>
                      </svg>
                    )
                  }
                >
                  {isLoading ? "Memuat Data..." : "Tampilkan Data"}
                </Button>
              </div>
            </div>
          </Form>
        </CardBody>
      </Card>
    </div>
  );
}
