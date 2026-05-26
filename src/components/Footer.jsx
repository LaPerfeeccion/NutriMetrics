import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import './Footer.css';

export const Footer = ({ idProveedor }) => {
  const [proveedor, setProveedor] = useState({
    nombre: '',
    correo: '',
    telefono: ''
  });

  useEffect(() => {
    let isMounted = true;
    console.log('idProveedor:', idProveedor, typeof idProveedor);
    const loadProveedor = async () => {
      const id = Number(idProveedor);

      if (!Number.isFinite(id)) {
        setProveedor({ nombre: '', correo: '', telefono: '' });
        return;
      }

      try {
        const { data, error } = await supabase
          .from('proveedor')
          .select('nombre, correo, telefono')
          .eq('id_proveedor', id)
          .maybeSingle();

        if (error) throw error;

        if (isMounted) {
          setProveedor({
            nombre: data?.nombre ?? '',
            correo: data?.correo ?? '',
            telefono: data?.telefono ?? ''
          });
        }
      } catch {
        if (isMounted) setProveedor({ nombre: '', correo: '', telefono: '' });
      }
    };

    if (idProveedor !== undefined && idProveedor !== null) {
      loadProveedor();
    }

    return () => {
      isMounted = false;
    };
  }, [idProveedor]);

  return (
    <div className="footer">
      <div className="proveedor">
        {proveedor.nombre || <span>Proveedor</span>}
        {proveedor.correo ? <span>📧 {proveedor.correo}</span> : ''}<span/>
        {proveedor.telefono ? <span>📞 {proveedor.telefono}</span> : null}
      </div>
    </div>
  );
};
