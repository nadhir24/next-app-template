"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Link } from "@heroui/link";
<<<<<<< HEAD
import { toast, Toaster } from "sonner";
=======
import { toast } from "sonner";
>>>>>>> 77f85158d758c5ddc80273101a0ba52b5035df76
import { Image } from "@heroui/image";
import { Divider } from "@heroui/divider";
import { Trash2 } from "lucide-react";
import { Modal, ModalContent, ModalBody, useDisclosure } from "@heroui/modal";
import { useCart, CartItem } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

<<<<<<< HEAD
type SizeWithQty = {
  id: number;
  size: string;
  price: string;
  qty?: number;
};

=======
>>>>>>> 77f85158d758c5ddc80273101a0ba52b5035df76
const CartPage = () => {
  const router = useRouter();
  const {
    cartItems: contextCartItems,
    cartCount,
    cartTotal,
    isLoadingCart,
    fetchCart,
    updateCartItem,
    removeFromCart,
  } = useCart();
  const { theme } = useTheme();

  const [displayCartItems, setDisplayCartItems] = useState<CartItem[]>([]);
  const [processingItems, setProcessingItems] = useState<
    Record<number, boolean>
  >({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);

  // Initialize local state from context
  useEffect(() => {
    setDisplayCartItems(contextCartItems);
  }, [contextCartItems]);

<<<<<<< HEAD
  // Fungsi utilitas untuk menampilkan pesan error (lebih sederhana)
  const showErrorMessage = (message: string) => {
    // Cek jika pesan berisi "Insufficient stock", format menjadi lebih user-friendly
    if (message.includes("Insufficient stock")) {
      const errorParts =
        /Insufficient stock for (.*?) \((.*?)\). Available: (\d+)/.exec(
          message
        );
      if (errorParts) {
        const [_, productName, size, available] = errorParts;
        const friendlyMessage = `Stok ${productName} (${size}) tidak cukup. Tersedia: ${available}`;

        console.log("[CartPage] Showing friendly toast:", friendlyMessage);
        toast.error(friendlyMessage, {
          duration: 4000,
          position: "top-center",
          style: { fontWeight: "500" },
        });
        return; // Keluar dari fungsi setelah menampilkan pesan yang diformat
      }
    }

    // Untuk pesan error lainnya
    console.log("[CartPage] Showing toast:", message);
    toast.error(message, {
      duration: 4000,
      position: "top-center",
      style: { fontWeight: "500" },
    });
  };

=======
>>>>>>> 77f85158d758c5ddc80273101a0ba52b5035df76
  // Handle quantity change with optimistic update
  const handleUpdateQuantity = useCallback(
    async (id: number, currentQuantity: number, change: number) => {
      const newQuantity = currentQuantity + change;
<<<<<<< HEAD
      console.log(
        `[CartPage] handleUpdateQuantity: id=${id}, currentQ=${currentQuantity}, change=${change}, newQ=${newQuantity}`
      );
      if (newQuantity < 1 || processingItems[id]) {
        console.log(
          `[CartPage] Condition met: newQuantity < 1 or processingItems[id]`
        );
        return;
      }

      // Cari item yang akan diupdate
      const item = displayCartItems.find((item) => item.id === id);
      console.log("[CartPage] Found item:", item);

      const size = item?.size as SizeWithQty | undefined;
      console.log("[CartPage] Item size data:", size);

      const availableStock =
        size && typeof size.qty !== "undefined" ? Number(size.qty) : Infinity;
      console.log("[CartPage] Available stock calculated:", availableStock);

      if (change > 0 && newQuantity > availableStock) {
        console.log(
          "[CartPage] STOCK CHECK FAILED: Condition met for toast (newQ > availableStock)"
        );
        showErrorMessage(
          `Stok tidak cukup. Maksimal quantity: ${availableStock}`
        );
        return;
      }
      console.log("[CartPage] Stock check passed or change is not positive.");
=======
      if (newQuantity < 1 || processingItems[id]) return;
>>>>>>> 77f85158d758c5ddc80273101a0ba52b5035df76

      const originalItems = [...displayCartItems];
      setDisplayCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
      setProcessingItems((prev) => ({ ...prev, [id]: true }));

      try {
        await updateCartItem(id, newQuantity);
<<<<<<< HEAD
      } catch (error: any) {
        // Hanya log error, TIDAK menampilkan toast
        // Toast sudah ditampilkan di CartContext saat updateCartItem gagal
        console.log("[CartPage] Error updating cart item:", error);

        // Kembalikan state ke awal
=======
      } catch (error) {
        toast.error("Gagal mengubah jumlah item");
>>>>>>> 77f85158d758c5ddc80273101a0ba52b5035df76
        setDisplayCartItems(originalItems);
      } finally {
        setProcessingItems((prev) => ({ ...prev, [id]: false }));
      }
    },
    [updateCartItem, displayCartItems, processingItems]
  );

  // Handle delete confirmation
  const confirmDeletion = (item: CartItem) => {
    setItemToDelete(item);
    onOpen();
  };

  // Handle item removal with optimistic update
  const handleDelete = useCallback(async () => {
    if (!itemToDelete || processingItems[itemToDelete.id]) return;
    const idToDelete = itemToDelete.id;
    const originalItems = [...displayCartItems];

    setDisplayCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== idToDelete)
    );
    setProcessingItems((prev) => ({ ...prev, [idToDelete]: true }));

    onClose();

    try {
      await removeFromCart(idToDelete);
      toast.success("Item berhasil dihapus");
    } catch (error) {
      toast.error("Gagal menghapus item");
      setDisplayCartItems(originalItems);
    } finally {
      setProcessingItems((prev) => ({ ...prev, [idToDelete]: false }));
      setItemToDelete(null);
    }
  }, [itemToDelete, removeFromCart, displayCartItems, processingItems]);

  // Loading skeleton
  if (isLoadingCart && displayCartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Keranjang Belanja</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {[...Array(2)].map((_, i) => (
              <Card key={i} shadow="sm" className="overflow-hidden">
                <CardBody className="p-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
          <div className="md:col-span-1">
            <Card shadow="sm">
              <CardBody className="p-4 space-y-3">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-px bg-gray-200 dark:bg-gray-700 w-full"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full mt-4"></div>
                <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-full mt-2"></div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const formatPrice = (price: string | number | undefined) => {
    if (!price) return "Rp0";
    if (typeof price === "string") {
<<<<<<< HEAD
      // If already formatted with Rp, return as is
      if (price.includes("Rp")) return price;

      // Otherwise, try to parse it and format
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(parseInt(price.replace(/\D/g, "") || "0"));
=======
      return price;
>>>>>>> 77f85158d758c5ddc80273101a0ba52b5035df76
    }
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
<<<<<<< HEAD
    <div className="container mx-auto py-8 px-4">
      <Toaster position="top-center" richColors closeButton />

=======
    <div className="container mx-auto px-4 py-8">
>>>>>>> 77f85158d758c5ddc80273101a0ba52b5035df76
      <h1 className="text-2xl font-bold mb-6">Keranjang Belanja</h1>

      {displayCartItems.length === 0 && !isLoadingCart ? (
        <Card className="dark:bg-zinc-800">
          <CardBody className="text-center pt-6 pb-12">
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Keranjang belanja Anda kosong
            </p>
            <div className="flex justify-center">
              <Link href="/katalog">
                <Button color="primary">Belanja Sekarang</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {displayCartItems.map((item) => (
              <div key={item.id} className="mb-4">
                <Card
                  shadow="sm"
                  className={`overflow-hidden dark:bg-zinc-800 dark:border dark:border-zinc-700`}
                >
                  <CardBody className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {item.catalog?.image && (
                        <Image
                          src={item.catalog.image}
                          alt={item.catalog?.name || "Product Image"}
                          className="w-24 h-24 object-cover rounded flex-shrink-0"
                          width={96}
                          height={96}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold capitalize truncate">
                          {item.catalog?.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Ukuran: {item.size?.size}
                        </p>
                        <p className="text-md font-medium">
                          Harga: {formatPrice(item.size?.price)}
                        </p>
                        <div className="flex items-center mt-2">
                          <Button
                            size="sm"
                            isIconOnly
                            variant="flat"
                            isDisabled={
                              processingItems[item.id] || item.quantity <= 1
                            }
                            onPress={() =>
                              handleUpdateQuantity(item.id, item.quantity, -1)
                            }
                          >
                            -
                          </Button>
                          <span className="mx-4 w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            isIconOnly
                            variant="flat"
                            isDisabled={processingItems[item.id]}
                            onPress={() =>
                              handleUpdateQuantity(item.id, item.quantity, +1)
                            }
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between sm:pl-4">
                        <Button
                          isIconOnly
                          color="danger"
                          variant="light"
                          onPress={() => confirmDeletion(item)}
                          isDisabled={processingItems[item.id]}
                          className="flex-shrink-0"
                        >
                          <Trash2 size={18} />
                        </Button>
                        <div className="text-right mt-4 sm:mt-0">
                          <p className="font-semibold whitespace-nowrap">
                            {formatPrice(
                              parseInt(
<<<<<<< HEAD
                                item.size?.price
                                  ?.toString()
                                  .replace(/[^\d]/g, "") || "0"
=======
                                item.size?.price?.replace(/[^\d]/g, "") || "0"
>>>>>>> 77f85158d758c5ddc80273101a0ba52b5035df76
                              ) * item.quantity
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            ))}
          </div>

          <div>
            <Card
              shadow="sm"
              className="sticky top-4 dark:bg-zinc-800 dark:border dark:border-zinc-700"
            >
              <CardBody className="p-4">
                <h3 className="text-xl font-bold mb-4">Ringkasan Belanja</h3>
                <Divider className="my-2 dark:border-zinc-700" />
                <div className="flex justify-between items-center mb-2">
                  <span>Total Item:</span>
                  <span>{cartCount}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span>Total:</span>
                  <span className="font-semibold text-xl">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
                <Button
                  color="primary"
                  className="w-full mt-4"
                  onPress={() => {
                    setIsCheckingOut(true);
                    router.push("/checkout");
                  }}
                  isDisabled={displayCartItems.length === 0 || isCheckingOut}
                >
                  Checkout Sekarang
                </Button>
                <Button
                  variant="flat"
                  className="w-full mt-2 dark:text-gray-300 dark:border-zinc-700 dark:hover:bg-zinc-700"
                  onPress={() => router.push("/katalog")}
                  isDisabled={isCheckingOut}
                >
                  Lanjut Belanja
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      <Modal
        isOpen={isOpen}
        onClose={() => {
          if (!processingItems[itemToDelete?.id ?? 0]) {
            setItemToDelete(null);
            onClose();
          }
        }}
      >
        <ModalContent className="dark:bg-zinc-800">
          <ModalBody className="p-6">
            <p className="mb-4 dark:text-gray-300">
              Apakah Anda yakin ingin menghapus item "
              {itemToDelete?.catalog?.name} ({itemToDelete?.size?.size})"?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="light"
                onPress={() => {
                  setItemToDelete(null);
                  onClose();
                }}
                isDisabled={processingItems[itemToDelete?.id ?? 0]}
              >
                Batal
              </Button>
              <Button
                color="danger"
                onPress={handleDelete}
                isLoading={processingItems[itemToDelete?.id ?? 0]}
              >
                Hapus
              </Button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default CartPage;
