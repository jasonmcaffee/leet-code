# LeetCode Solutions Visualization

This project provides interactive visualizations of various data structures and algorithms, starting with a Min Heap implementation. The visualizations are built using React and Three.js to create an engaging 3D experience.

## Features

- Interactive 3D visualization of a Min Heap
- Real-time node addition and heap property maintenance
- Color-coded nodes to show heap operations
- Smooth animations and transitions
- Responsive design

## Getting Started

### Prerequisites

- Node.js (v23.6.1)
- npm (v6 or higher)
- nvm (Node Version Manager)

### Setting up nvm

This project uses Node.js version 23.6.1, which is specified in the `.nvmrc` file. To automatically switch to the correct Node.js version when entering the project directory, add the following to your `.zshrc`:

```bash
# Add this to your .zshrc
autoload -U add-zsh-hook
load-nvmrc() {
  local node_version="$(nvm version)"
  local nvmrc_path="$(nvm_find_nvmrc)"

  if [ -n "$nvmrc_path" ]; then
    local nvmrc_node_version=$(nvm version "$(cat "${nvmrc_path}")")

    if [ "$nvmrc_node_version" = "N/A" ]; then
      nvm install
    elif [ "$nvmrc_node_version" != "$node_version" ]; then
      nvm use
    fi
  elif [ "$node_version" != "$(nvm version default)" ]; then
    nvm use default
  fi
}
add-zsh-hook chpwd load-nvmrc
load-nvmrc
```

After adding this configuration, restart your terminal or run `source ~/.zshrc` to apply the changes.

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/leet-code.git
cd leet-code
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

- Click "Add Random Value" to insert a new node into the heap
- Use arrow keys to scroll up and down the visualization
- The visualization will automatically maintain the heap property
- New nodes are shown in green
- Nodes affected by heap operations are shown in blue
- Default nodes are shown in purple

## Technologies Used

- React
- Three.js
- TypeScript
- Next.js

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
