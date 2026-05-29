-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.alimento (
  id_alimento integer NOT NULL DEFAULT nextval('alimento_id_alimento_seq'::regclass),
  nombre character varying NOT NULL,
  calorias integer,
  proteinas numeric,
  carbohidratos numeric,
  grasas numeric,
  CONSTRAINT alimento_pkey PRIMARY KEY (id_alimento)
);
CREATE TABLE public.colegio (
  id_colegio integer NOT NULL DEFAULT nextval('colegio_id_colegio_seq'::regclass),
  nombre character varying NOT NULL,
  ubicacion character varying,
  cantidad_estudiantes integer,
  id_proveedor integer,
  CONSTRAINT colegio_pkey PRIMARY KEY (id_colegio),
  CONSTRAINT fk_proveedor FOREIGN KEY (id_proveedor) REFERENCES public.proveedor(id_proveedor)
);
CREATE TABLE public.consumo (
  id_consumo integer NOT NULL DEFAULT nextval('consumo_id_consumo_seq'::regclass),
  fecha date NOT NULL,
  observaciones text,
  id_estudiante integer,
  id_plato integer,
  CONSTRAINT consumo_pkey PRIMARY KEY (id_consumo),
  CONSTRAINT fk_estudiante FOREIGN KEY (id_estudiante) REFERENCES public.estudiante(id_estudiante),
  CONSTRAINT fk_plato FOREIGN KEY (id_plato) REFERENCES public.plato(id_plato)
);
CREATE TABLE public.estudiante (
  id_estudiante integer NOT NULL DEFAULT nextval('estudiante_id_estudiante_seq'::regclass),
  nombre character varying NOT NULL,
  edad integer,
  grado character varying,
  estado_nutricional character varying,
  peso numeric,
  altura numeric,
  id_colegio integer,
  CONSTRAINT estudiante_pkey PRIMARY KEY (id_estudiante),
  CONSTRAINT fk_colegio FOREIGN KEY (id_colegio) REFERENCES public.colegio(id_colegio)
);
CREATE TABLE public.plato (
  id_plato integer NOT NULL DEFAULT nextval('plato_id_plato_seq'::regclass),
  nombre character varying NOT NULL,
  tipo_comida character varying,
  calorias integer,
  proteinas numeric,
  carbohidratos numeric,
  grasas numeric,
  CONSTRAINT plato_pkey PRIMARY KEY (id_plato)
);
CREATE TABLE public.proveedor (
  id_proveedor integer NOT NULL DEFAULT nextval('proveedor_id_proveedor_seq'::regclass),
  nombre character varying NOT NULL,
  telefono character varying,
  correo character varying,
  CONSTRAINT proveedor_pkey PRIMARY KEY (id_proveedor)
);