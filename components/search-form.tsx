import React, { useState, useCallback } from "react";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Form
        onSubmit={handleSubmit}
        validationErrors={validationErrors}
        className="mb-10 w-full"
        aria-label="Search Form"
        validationBehavior="aria"
      >
        <Card
          className="w-full overflow-hidden border-none bg-zinc-950/95 shadow-xl backdrop-blur-lg dark:bg-zinc-950/95"
          radius="lg"
          isBlurred
        >
          <CardHeader className="border-b border-zinc-800 bg-zinc-900 p-6 dark:bg-zinc-900">
            <motion.div
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="mb-1 text-lg font-medium text-white">
                Cari Informasi
              </h3>
              <p className="text-sm text-zinc-400">
                Masukkan NPM, nama, atau kelas untuk mencari data
              </p>
            </motion.div>
          </CardHeader>

          <CardBody className="p-4 sm:p-6 md:p-8">
            <div className="space-y-4 sm:space-y-6">
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Input
                  type="search"
                  label="Kata Kunci Pencarian"
                  placeholder="NPM, nama, atau kode kelas (contoh: 2IA14)"
                  value={kelas}
                  onChange={handleKelasChange}
                  onClear={handleClear}
                  name="kelas"
                  id="search-input"
                  size="lg"
                  isRequired
                  isClearable
                  autoComplete="off"
                  errorMessage={validationErrors.kelas}
                  isInvalid={!!validationErrors.kelas}
                  variant="bordered"
                  color="secondary"
                  radius="lg"
                  labelPlacement="outside"
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
                    label: "text-zinc-400 font-medium text-xs sm:text-sm",
                    description: "text-zinc-500 text-xs mt-1.5",
                    inputWrapper: [
                      "bg-zinc-900/60",
                      "backdrop-blur-md",
                      "border-purple-900/50",
                      "hover:bg-zinc-800/60",
                      "group-data-[focused=true]:bg-zinc-800/80",
                      "group-data-[focused=true]:ring-2 ring-purple-500/30",
                      "!cursor-text",
                      "transition-all duration-200",
                    ],
                    input: "text-zinc-200 placeholder:text-zinc-600",
                    innerWrapper: "flex gap-2",
                    clearButton: "text-zinc-400 hover:text-purple-400",
                    errorMessage: "text-danger text-xs mt-1",
                    helperWrapper: "flex flex-col mt-1.5",
                  }}
                />
              </motion.div>

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 sm:p-4"
              >
                <div className="flex items-center gap-2 text-xs text-zinc-400 sm:text-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 flex-shrink-0 text-purple-400 sm:h-5 sm:w-5"
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
              </motion.div>

              <Divider className="my-2 bg-zinc-800" />

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div>
                  <div className="mb-2 flex items-center justify-between sm:mb-3">
                    <h4 className="text-xs font-medium text-zinc-300 sm:text-sm">
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
                        "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3",
                    }}
                    isRequired
                    errorMessage={validationErrors.options}
                    isInvalid={!!validationErrors.options}
                    color="secondary"
                    description="Pilih jenis data yang ingin dicari"
                  >
                    <Tooltip content="Lihat jadwal perkuliahan" placement="top">
                      <Checkbox
                        value="jadwal"
                        classNames={{
                          base: "inline-flex max-w-full bg-zinc-900/80 hover:bg-zinc-800/80 rounded-lg data-[selected=true]:bg-purple-950/50 p-2 sm:p-3 transition-all data-[selected=true]:border-purple-700 border border-zinc-800",
                          label: "text-zinc-300 font-medium text-xs sm:text-sm",
                          wrapper: "h-3.5 w-3.5 sm:h-4 sm:w-4",
                        }}
                        size="sm"
                        color="secondary"
                      >
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5 text-purple-400 sm:h-4 sm:w-4"
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
                          base: "inline-flex max-w-full bg-zinc-900/80 hover:bg-zinc-800/80 rounded-lg data-[selected=true]:bg-purple-950/50 p-2 sm:p-3 data-[disabled=true]:opacity-50 transition-all data-[selected=true]:border-purple-700 border border-zinc-800",
                          label: "text-zinc-300 font-medium text-xs sm:text-sm",
                          wrapper: "h-3.5 w-3.5 sm:h-4 sm:w-4",
                        }}
                        size="sm"
                        color="secondary"
                      >
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5 text-purple-400 sm:h-4 sm:w-4"
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
                          base: "inline-flex max-w-full bg-zinc-900/80 hover:bg-zinc-800/80 rounded-lg data-[selected=true]:bg-purple-950/50 p-2 sm:p-3 data-[disabled=true]:opacity-50 transition-all data-[selected=true]:border-purple-700 border border-zinc-800",
                          label: "text-zinc-300 font-medium text-xs sm:text-sm",
                          wrapper: "h-3.5 w-3.5 sm:h-4 sm:w-4",
                        }}
                        size="sm"
                        color="secondary"
                      >
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5 text-purple-400 sm:h-4 sm:w-4"
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
              </motion.div>
            </div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6 sm:mt-8"
            >
              <Button
                type="submit"
                color="secondary"
                isLoading={isLoading}
                isDisabled={!kelas.trim() || selectedOptions.length === 0}
                size="lg"
                radius="lg"
                variant="shadow"
                className="w-full font-medium"
                startContent={
                  !isLoading && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 sm:h-5 sm:w-5"
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
            </motion.div>
          </CardBody>

          <CardFooter className="border-t border-zinc-800 px-4 py-3 text-xs text-zinc-500 sm:px-6 sm:py-4">
            Cari informasi akademik terbaru dengan mudah
          </CardFooter>
        </Card>
      </Form>
    </motion.div>
  );
}
