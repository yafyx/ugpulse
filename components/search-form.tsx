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
} from "@heroui/react";
import { motion } from "framer-motion";

interface SearchFormProps {
  onSubmit: (kelas: string, selectedOptions: string[]) => void;
  isLoading: boolean;
}

export default function SearchForm({ onSubmit, isLoading }: SearchFormProps) {
  const [kelas, setKelas] = useState<string>("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleKelasChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setKelas(e.target.value);
      if (error) setError(null);
    },
    [error],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!kelas.trim()) {
        setError("Masukkan kata kunci pencarian");
        return;
      }
      if (selectedOptions.length === 0) {
        setError("Pilih minimal satu kategori pencarian");
        return;
      }
      setError(null);
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
      if (error) setError(null);
    },
    [error],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit} className="mb-10">
        <Card className="overflow-hidden border-none bg-gradient-to-br from-white/90 to-white/70 shadow-xl backdrop-blur-lg dark:from-zinc-800/90 dark:to-zinc-900/70">
          <CardBody className="p-0">
            <div className="flex flex-col">
              <div className="bg-gradient-to-r from-zinc-100/90 to-zinc-50/80 p-6 dark:from-zinc-800/90 dark:to-zinc-700/80">
                <motion.div
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="mb-1 text-lg font-medium text-zinc-800 dark:text-zinc-100">
                    Cari Informasi
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Masukkan NPM, nama, atau kelas untuk mencari data
                  </p>
                </motion.div>
              </div>

              <div className="p-6 md:p-8">
                <div className="space-y-6">
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Input
                      variant="flat"
                      type="text"
                      label="Kata Kunci Pencarian"
                      placeholder="NPM, nama, atau kode kelas (contoh: 2IA14)"
                      value={kelas}
                      onChange={handleKelasChange}
                      aria-label="Kelas atau nama pencarian"
                      size="lg"
                      startContent={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-zinc-400"
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
                      }
                      classNames={{
                        label:
                          "text-zinc-700 font-medium dark:text-zinc-300 text-sm",
                        input: [
                          "bg-transparent",
                          "text-zinc-800 dark:text-zinc-200",
                          "placeholder:text-zinc-400/70",
                        ],
                        inputWrapper: [
                          "bg-zinc-100/60 dark:bg-zinc-800/60",
                          "backdrop-blur-md",
                          "border-zinc-200 dark:border-zinc-700",
                          "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                          "group-data-[focused=true]:bg-zinc-100 dark:group-data-[focused=true]:bg-zinc-800",
                          "group-data-[focused=true]:ring-2 ring-zinc-200 dark:ring-zinc-700",
                          "!cursor-text",
                        ],
                      }}
                      isRequired
                      errorMessage={
                        error && error.includes("kata kunci")
                          ? error
                          : undefined
                      }
                      isInvalid={
                        error && error.includes("kata kunci") ? true : false
                      }
                    />
                  </motion.div>

                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-lg border border-zinc-100 bg-zinc-50/80 p-4 dark:border-zinc-700 dark:bg-zinc-800/50"
                  >
                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-amber-500"
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

                  <Divider className="my-2" />

                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          Pilih Kategori Pencarian
                        </h4>
                        {error && error.includes("kategori") && (
                          <Chip color="danger" size="sm" variant="flat">
                            {error}
                          </Chip>
                        )}
                      </div>
                      <CheckboxGroup
                        orientation="horizontal"
                        value={selectedOptions}
                        onValueChange={handleOptionsChange}
                        aria-label="Opsi pencarian"
                        classNames={{
                          wrapper: "flex flex-wrap gap-4",
                        }}
                        isRequired
                        errorMessage={
                          error && error.includes("kategori")
                            ? error
                            : undefined
                        }
                        isInvalid={
                          error && error.includes("kategori") ? true : false
                        }
                      >
                        <Tooltip
                          content="Lihat jadwal perkuliahan"
                          placement="top"
                        >
                          <Checkbox
                            value="jadwal"
                            classNames={{
                              base: "inline-flex max-w-md bg-zinc-100/80 hover:bg-zinc-200/60 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/60 rounded-lg data-[selected=true]:bg-blue-50 dark:data-[selected=true]:bg-blue-900/20 p-3 transition-all data-[selected=true]:border-blue-200 dark:data-[selected=true]:border-blue-800 border border-transparent",
                              label: "text-zinc-700 dark:text-zinc-300",
                            }}
                            size="md"
                          >
                            <div className="flex items-center gap-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-blue-500"
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
                            isDisabled={selectedOptions.includes(
                              "mahasiswaBaru",
                            )}
                            classNames={{
                              base: "inline-flex max-w-md bg-zinc-100/80 hover:bg-zinc-200/60 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/60 rounded-lg data-[selected=true]:bg-green-50 dark:data-[selected=true]:bg-green-900/20 p-3 data-[disabled=true]:opacity-50 transition-all data-[selected=true]:border-green-200 dark:data-[selected=true]:border-green-800 border border-transparent",
                              label: "text-zinc-700 dark:text-zinc-300",
                            }}
                            size="md"
                          >
                            <div className="flex items-center gap-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-green-500"
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

                        <Tooltip
                          content="Informasi mahasiswa baru"
                          placement="top"
                        >
                          <Checkbox
                            value="mahasiswaBaru"
                            isDisabled={selectedOptions.includes("kelasBaru")}
                            classNames={{
                              base: "inline-flex max-w-md bg-zinc-100/80 hover:bg-zinc-200/60 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/60 rounded-lg data-[selected=true]:bg-purple-50 dark:data-[selected=true]:bg-purple-900/20 p-3 data-[disabled=true]:opacity-50 transition-all data-[selected=true]:border-purple-200 dark:data-[selected=true]:border-purple-800 border border-transparent",
                              label: "text-zinc-700 dark:text-zinc-300",
                            }}
                            size="md"
                          >
                            <div className="flex items-center gap-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-purple-500"
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
                >
                  <Button
                    type="submit"
                    className="mt-8 w-full bg-gradient-to-r from-zinc-800 to-zinc-700 font-medium text-white shadow-lg transition-all duration-200 hover:from-zinc-900 hover:to-zinc-800 dark:from-zinc-700 dark:to-zinc-600 dark:hover:from-zinc-600 dark:hover:to-zinc-500"
                    isLoading={isLoading}
                    isDisabled={!kelas.trim() || selectedOptions.length === 0}
                    size="lg"
                    radius="sm"
                    startContent={
                      !isLoading && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
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
              </div>
            </div>
          </CardBody>
        </Card>
      </form>
    </motion.div>
  );
}
