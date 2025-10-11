import type { Meta, StoryObj } from "@storybook/react";
import ProductCard from "./ProductCard";

const meta: Meta<typeof ProductCard> = {
  title: "Molecules/ProductCard",
  component: ProductCard
};
export default meta;

type Story = StoryObj<typeof ProductCard>;

export const Basic: Story = {
  args: {
    id: "SKU1001",
    title: "Sample Product",
    price: 19.99,
    image: "/logo.svg",
    onAdd: () => {}
  }
};
