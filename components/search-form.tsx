import React, { useState, useCallback, useEffect } from "react";
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
import { Search, Info, Calendar, Users, User, Mail } from "lucide-react";
import { IOSpinner } from "./IOSpinner";
import CheckIcon from "./CheckIcon";

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
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

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

  useEffect(() => {
    if (!isLoading && showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isLoading && !showSuccess) {
      setShowSuccess(true);
    }
  }, [isLoading, showSuccess]);

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

  const getButtonContent = () => {
    if (isLoading) {
      return "Memuat Data...";
    } else if (!isLoading && showSuccess) {
      return "Data Ditemukan";
    } else {
      return "Tampilkan Data";
    }
  };

  const getStartContent = () => {
    if (isLoading) {
      return null;
    } else if (!isLoading && showSuccess) {
      return <CheckIcon />;
    } else {
      return <Search className="h-4 w-4" />;
    }
  };

  return (
    <div className="search-form-container w-full">
      <Card className="w-full overflow-hidden border border-zinc-200/20 bg-white/90 shadow-lg backdrop-blur-sm dark:border-zinc-700/30 dark:bg-zinc-900/90">
        <CardBody className="p-0">
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
                labelPlacement="outside"
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
                  <Search className="pointer-events-none h-4 w-4 flex-shrink-0 text-purple-400" />
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
                  <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-400" />
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

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <CheckboxGroup
                      orientation="horizontal"
                      value={selectedOptions}
                      onValueChange={handleOptionsChange}
                      name="searchOptions"
                      aria-label="Opsi pencarian"
                      classNames={{
                        wrapper: "flex flex-wrap gap-3 w-full",
                        label: "flex items-center",
                      }}
                      isRequired
                      errorMessage={validationErrors.options}
                      isInvalid={!!validationErrors.options}
                      color="secondary"
                    >
                      <Checkbox
                        value="jadwal"
                        size="sm"
                        color="secondary"
                        className="min-w-[150px] flex-1"
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-purple-500" />
                          Jadwal Kelas
                        </div>
                      </Checkbox>

                      <Checkbox
                        value="kelasBaru"
                        isDisabled={selectedOptions.includes("mahasiswaBaru")}
                        size="sm"
                        color="secondary"
                        className="min-w-[150px] flex-1"
                      >
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-purple-500" />
                          Kelas Baru
                        </div>
                      </Checkbox>

                      <Checkbox
                        value="mahasiswaBaru"
                        isDisabled={selectedOptions.includes("kelasBaru")}
                        size="sm"
                        color="secondary"
                        className="min-w-[150px] flex-1"
                      >
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-purple-500" />
                          Mahasiswa Baru
                        </div>
                      </Checkbox>
                    </CheckboxGroup>
                  </div>

                  <Button
                    type="submit"
                    color="secondary"
                    isLoading={isLoading}
                    isDisabled={!kelas.trim() || selectedOptions.length === 0}
                    radius="lg"
                    variant="shadow"
                    className="w-full whitespace-nowrap text-sm font-medium sm:w-auto sm:text-base"
                    size="lg"
                    startContent={getStartContent()}
                    spinner={<IOSpinner />}
                  >
                    {getButtonContent()}
                  </Button>
                </div>
              </div>
            </div>
          </Form>
        </CardBody>
      </Card>
    </div>
  );
}
