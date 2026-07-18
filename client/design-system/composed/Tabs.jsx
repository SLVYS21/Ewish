import React from 'react';
import { Icon } from '../Icon.jsx';

/**
 * Tabs — controlled, avec indicateur or.
 *
 * <Tabs value={tab} onChange={setTab}>
 *   <Tabs.List>
 *     <Tabs.Trigger value="cartes" icon="Sparkles">Cartes</Tabs.Trigger>
 *     <Tabs.Trigger value="murs" icon="LayoutGrid">Murs</Tabs.Trigger>
 *   </Tabs.List>
 *   <Tabs.Panel value="cartes">Contenu cartes</Tabs.Panel>
 *   <Tabs.Panel value="murs">Contenu murs</Tabs.Panel>
 * </Tabs>
 */

const TabsContext = React.createContext(null);

export function Tabs({ value, onChange, children, className = '', ...rest }) {
  return (
    <TabsContext.Provider value={{ value, onChange }}>
      <div className={`mk-tabs ${className}`} {...rest}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

Tabs.List = function TabsList({ children, className = '', ...rest }) {
  return (
    <div role="tablist" className={`mk-tabs__list ${className}`} {...rest}>
      {children}
    </div>
  );
};

Tabs.Trigger = function TabsTrigger({ value, icon, children, className = '', ...rest }) {
  const ctx = React.useContext(TabsContext);
  const selected = ctx?.value === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      className={`mk-tabs__trigger ${className}`}
      onClick={() => ctx?.onChange?.(value)}
      {...rest}
    >
      {icon && <Icon name={icon} size="sm" />}
      {children}
    </button>
  );
};

Tabs.Panel = function TabsPanel({ value, children, className = '', ...rest }) {
  const ctx = React.useContext(TabsContext);
  if (ctx?.value !== value) return null;
  return (
    <div role="tabpanel" className={`mk-tabs__panel ${className}`} {...rest}>
      {children}
    </div>
  );
};

export default Tabs;
