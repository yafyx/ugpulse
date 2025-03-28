import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Divider,
} from "@heroui/react";
import { getLastFetchedFormatted, getTimelineHistory } from "@/lib/db/timeline";
import { Clock, ArrowDownUp, RefreshCw } from "lucide-react";

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function VersionHistoryModal({
  isOpen,
  onClose,
  onRefresh,
  isRefreshing = false,
}: VersionHistoryModalProps) {
  const history = getTimelineHistory();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      classNames={{
        base: "bg-white/95 dark:bg-zinc-900/95 border border-zinc-200/20 dark:border-zinc-700/20",
        header: "border-b border-zinc-200/20 dark:border-zinc-700/20",
        body: "p-0",
        footer: "border-t border-zinc-200/20 dark:border-zinc-700/20",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
                Riwayat Pembaruan Timeline
              </h2>
              <p className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
                Menampilkan 10 pembaruan terakhir
              </p>
            </div>
            {onRefresh && (
              <Button
                size="sm"
                variant="flat"
                className="gap-2 bg-purple-100/50 text-purple-800 hover:bg-purple-200/60 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-800/40"
                onClick={onRefresh}
                isLoading={isRefreshing}
                startContent={
                  !isRefreshing && <RefreshCw className="h-4 w-4" />
                }
              >
                {isRefreshing ? "Memperbarui..." : "Perbarui Data"}
              </Button>
            )}
          </div>
        </ModalHeader>
        <Divider className="bg-zinc-200/20 dark:bg-zinc-700/20" />
        <ModalBody>
          <div className="max-h-[60vh] overflow-y-auto px-6">
            <div className="relative">
              <div className="absolute bottom-0 left-[21px] top-0 w-px bg-zinc-200 dark:bg-zinc-700"></div>
              {history.length > 0 ? (
                history.map((version, index) => (
                  <div
                    key={version.timestamp}
                    className="relative mb-6 flex gap-4 last:mb-0"
                  >
                    <div className="relative mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
                      {index === 0 ? (
                        <Clock className="h-5 w-5 text-purple-500" />
                      ) : (
                        <ArrowDownUp className="h-5 w-5 text-zinc-400" />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-col gap-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {index === 0 ? "Pembaruan Terbaru" : "Pembaruan Data"}
                        </span>
                        {version.changes && version.changes > 0 && (
                          <Chip
                            size="sm"
                            variant="flat"
                            className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                          >
                            {version.changes} perubahan
                          </Chip>
                        )}
                      </div>
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        {getLastFetchedFormatted(version.timestamp, false)}
                      </span>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                        {version.data.data.length} kegiatan tercatat
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="mb-4 rounded-full bg-zinc-100 p-3 dark:bg-zinc-800">
                    <Clock className="h-6 w-6 text-zinc-400" />
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Belum ada riwayat pembaruan
                  </p>
                </div>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="light"
            onPress={onClose}
            className="bg-zinc-100/50 text-zinc-800 hover:bg-zinc-200/60 dark:bg-zinc-800/50 dark:text-zinc-200 dark:hover:bg-zinc-700/60"
          >
            Tutup
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
