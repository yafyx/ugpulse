"use client";
import React, { useState } from "react";
import { Card, CardBody, CardHeader, CardFooter } from "@nextui-org/card";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Spinner,
} from "@nextui-org/react";
import useSWR from "swr";

interface NewsItem {
  id: string;
  title: string;
  link: string;
  date: string;
  content: string;
}

interface NewsDetail {
  id: string;
  title: string;
  content: string;
  date: string;
  url: string;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  return response.json();
};

export default function NewsSection() {
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch news list
  const {
    data: newsData,
    error: newsError,
    isLoading: isNewsLoading,
  } = useSWR<{ news: NewsItem[] }>("/api/news", fetcher);

  // Fetch news detail when a news item is selected
  const {
    data: newsDetail,
    error: detailError,
    isLoading: isDetailLoading,
  } = useSWR<NewsDetail>(
    selectedNewsId ? `/api/news/${selectedNewsId}` : null,
    fetcher,
  );

  const handleNewsClick = (id: string) => {
    setSelectedNewsId(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    // Return DD MMM YYYY format
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (newsError) return <div>Failed to load news</div>;

  return (
    <div className="w-full">
      <Card className="border border-zinc-200/20 bg-white/80 shadow-xl backdrop-blur-sm dark:border-zinc-700/30 dark:bg-zinc-800/80">
        <CardHeader className="border-b border-zinc-200/30 px-6 py-4 dark:border-zinc-700/30">
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
              Berita Terkini Universitas Gunadarma
            </h2>
            <p className="text-small text-zinc-500 dark:text-zinc-400">
              Data dari studentsite.gunadarma.ac.id
            </p>
          </div>
        </CardHeader>
        <CardBody>
          {isNewsLoading ? (
            <div className="flex justify-center py-8">
              <Spinner label="Memuat berita..." color="default" />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {newsData?.news && newsData.news.length > 0 ? (
                newsData.news.map((item) => (
                  <Card
                    key={item.id}
                    isPressable
                    isHoverable
                    className="border border-zinc-200/30 bg-white/60 shadow-md backdrop-blur-sm dark:border-zinc-700/40 dark:bg-zinc-800/60"
                    onPress={() => handleNewsClick(item.id)}
                  >
                    <CardBody className="p-4">
                      <h3
                        className="text-lg font-semibold text-zinc-800 dark:text-zinc-100"
                        dangerouslySetInnerHTML={{
                          __html: item.title.replace(
                            /TERBARU/g,
                            '<span class="text-red-500">TERBARU</span>',
                          ),
                        }}
                      />
                      {item.content && (
                        <p className="mt-2 line-clamp-2 text-zinc-600 dark:text-zinc-300">
                          {item.content}
                        </p>
                      )}
                      {item.date && (
                        <p className="mt-2 text-small text-zinc-500 dark:text-zinc-400">
                          {formatDate(item.date)}
                        </p>
                      )}
                    </CardBody>
                  </Card>
                ))
              ) : (
                <div className="p-4 text-center text-zinc-500 dark:text-zinc-400">
                  <p>Tidak ada berita tersedia saat ini</p>
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* News Detail Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} size="3xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b border-zinc-200/30 px-6 py-4 dark:border-zinc-700/30">
                {isDetailLoading ? (
                  "Loading..."
                ) : (
                  <div>
                    <h2
                      className="text-xl font-semibold"
                      dangerouslySetInnerHTML={{
                        __html: newsDetail?.title || "",
                      }}
                    />
                    {newsDetail?.date && (
                      <p className="text-small text-zinc-500 dark:text-zinc-400">
                        {formatDate(newsDetail.date)}
                      </p>
                    )}
                  </div>
                )}
              </ModalHeader>
              <ModalBody>
                {isDetailLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner label="Loading news details..." color="default" />
                  </div>
                ) : detailError ? (
                  <p className="text-red-500">Failed to load news details.</p>
                ) : (
                  <div className="whitespace-pre-line text-zinc-700 dark:text-zinc-300">
                    {newsDetail?.content}
                  </div>
                )}
              </ModalBody>
              <ModalFooter className="border-t border-zinc-200/30 px-6 py-3 dark:border-zinc-700/30">
                {newsDetail?.url && (
                  <Button
                    color="primary"
                    as="a"
                    href={newsDetail.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-zinc-800 font-medium text-white hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                  >
                    Lihat Sumber Asli
                  </Button>
                )}
                <Button
                  color="danger"
                  variant="light"
                  onPress={onClose}
                  className="text-zinc-700 dark:text-zinc-300"
                >
                  Tutup
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
