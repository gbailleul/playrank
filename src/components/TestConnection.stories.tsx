import type { Meta, StoryObj } from '@storybook/react';
import TestConnection from './TestConnection';

const meta = {
  title: 'Pages/TestConnection',
  component: TestConnection,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TestConnection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {}; 