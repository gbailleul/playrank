import type { Meta, StoryObj } from '@storybook/react';
import { GameButton } from './GameButton';
import '../../../styles/game.css';

const meta = {
  title: 'Atoms/GameButton',
  component: GameButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Boutons du jeu

Les boutons sont un élément crucial de notre interface de jeu. Nous suivons une hiérarchie visuelle stricte pour guider l'utilisateur :

## Règles d'utilisation

1. **Un seul bouton primary par vue** : Le bouton primary doit être utilisé uniquement pour l'action principale (CTA) de la page.
2. **Effet de reflet sans relief** : Les effets visuels ne doivent pas créer de sensation de profondeur ou de "pop".
3. **Hiérarchie claire** : Primary > Secondary > Option

## Variantes

- \`primary\` : Pour l'action principale (CTA) de la page
- \`secondary\` : Pour les actions secondaires importantes
- \`option\` : Pour les sélections et choix (peut avoir un état actif)

## Accessibilité

Tous les boutons sont conçus pour être accessibles au clavier et compatibles avec les lecteurs d'écran.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'option'],
      description: 'Style du bouton',
      table: {
        defaultValue: { summary: 'primary' },
      },
    },
    active: {
      control: 'boolean',
      description: 'État actif (uniquement pour variant="option")',
    },
    disabled: {
      control: 'boolean',
      description: 'État désactivé du bouton',
    },
    children: {
      control: 'text',
      description: 'Contenu du bouton',
    },
  },
} satisfies Meta<typeof GameButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Bouton Primary',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Bouton Secondary',
  },
};

export const Option: Story = {
  args: {
    variant: 'option',
    children: (
      <div>
        <div className="text-lg font-semibold">501</div>
        <div className="text-sm mt-1 text-[var(--text-secondary)]">
          Premier à zéro
        </div>
      </div>
    ),
  },
};

export const OptionActive: Story = {
  args: {
    variant: 'option',
    active: true,
    children: (
      <div>
        <div className="text-lg font-semibold">501</div>
        <div className="text-sm mt-1 text-[var(--text-secondary)]">
          Premier à zéro
        </div>
      </div>
    ),
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
    children: 'Bouton désactivé',
  },
};

export const InContext: Story = {
  args: {
    variant: 'primary',
    children: 'Placeholder'
  },
  parameters: {
    docs: {
      description: {
        story: `
### Exemple d'utilisation dans un formulaire

\`\`\`tsx
<form>
  {/* Options de jeu */}
  <div className="grid grid-cols-2 gap-4">
    <GameButton variant="option" active={selected === '501'}>
      <div className="text-lg font-semibold">501</div>
      <div className="text-sm mt-1">Premier à zéro</div>
    </GameButton>
    {/* Autres options... */}
  </div>

  {/* Action principale */}
  <GameButton variant="primary">
    Commencer la partie
  </GameButton>
</form>
\`\`\`
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="space-y-8 p-6 game-card max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          <GameButton variant="option" active>
            <div className="text-lg font-semibold">501</div>
            <div className="text-sm mt-1 text-[var(--text-secondary)]">
              Premier à zéro
            </div>
          </GameButton>
          <GameButton variant="option">
            <div className="text-lg font-semibold">Cricket</div>
            <div className="text-sm mt-1 text-[var(--text-secondary)]">
              Fermez les numéros
            </div>
          </GameButton>
        </div>
        <GameButton variant="primary">Commencer la partie</GameButton>
      </div>
    ),
  ],
}; 