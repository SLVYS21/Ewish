import { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordInput = forwardRef(function PasswordInput(props, ref) {
  const [visible, setVisible] = useState(false);
  const { style, ...rest } = props;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        ref={ref}
        {...rest}
        type={visible ? 'text' : 'password'}
        style={{ paddingRight: 42, ...style }}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        onClick={() => setVisible(v => !v)}
        style={{
          position: 'absolute',
          top: '50%', right: 10,
          transform: 'translateY(-50%)',
          width: 30, height: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', background: 'transparent',
          color: '#71717a', cursor: 'pointer', padding: 0, borderRadius: 6,
          touchAction: 'manipulation',
        }}
      >
        {visible ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
});

export default PasswordInput;
