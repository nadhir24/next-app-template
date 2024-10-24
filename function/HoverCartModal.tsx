import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/modal";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@nextui-org/button";

interface CartItem {
  id: number;
  name: string;
  image: string;
  sizes: Size[];
  qty: number;
  price: string;
}

interface Size {
  id: number;
  size: string;
  price: string;
}

// No need to pass props if state is managed internally in this example
export default function HoverCartModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Function to fetch cart items
  const fetchCartItems = async () => {
    const isLoggedIn = false; // Replace with actual login check
    if (isLoggedIn) {
      try {
        const response = await axios.get("http://localhost:5000/cart");
        setCartItems(response.data);
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    } else {
      const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
      setCartItems(guestCart);
    }
  };

  // UseEffect to fetch cart items when component mounts
  useEffect(() => {
    fetchCartItems();
  }, []);

  return (
    <>
      <Button onPress={() => setIsModalOpen(true)}>Open Cart</Button>
      <Modal
        size={"5xl"}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        aria-labelledby="cart-modal"
        aria-describedby="cart-modal-description"
        className="fixed right-0 top-0 w-full md:w-1/2 lg:w-1/3 h-full bg-white shadow-lg" // Adjust width here
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Your Cart
              </ModalHeader>
              <ModalBody>
                {cartItems.length === 0 ? (
                  <p>Your cart is empty.</p>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="flex items-center mb-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 mr-4"
                      />
                      <div className="flex-grow">
                        <h3>{item.name}</h3>
                        {item.sizes && item.sizes.length > 0 ? (
                          <>
                            <p>
                              Size: {item.sizes[0].size} - Price:{" "}
                              {item.sizes[0].price}
                            </p>
                            <p>Quantity: {item.qty}</p>
                          </>
                        ) : (
                          <p>No sizes available</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Checkout
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
