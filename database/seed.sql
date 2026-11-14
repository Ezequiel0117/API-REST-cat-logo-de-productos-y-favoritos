-- Productos de ejemplo (datos ficticios). Solo se insertan si la tabla está vacía.
INSERT INTO
  productos (nombre, descripcion, categoria, precio)
SELECT
  *
FROM
  (
    VALUES
      (
        'Laptop Nova 14',
        'Laptop ligera de 14 pulgadas, 16 GB RAM',
        'electronica',
        899.99
      ),
      (
        'Audífonos Eco',
        'Audífonos inalámbricos con cancelación',
        'electronica',
        59.90
      ),
      (
        'Camiseta Básica',
        'Camiseta de algodón color negro',
        'ropa',
        12.50
      ),
      (
        'Chaqueta Andina',
        'Chaqueta impermeable para lluvia',
        'ropa',
        45.00
      ),
      (
        'Taza Térmica',
        'Taza de acero inoxidable de 350 ml',
        'hogar',
        9.75
      ),
      (
        'Lámpara de Escritorio',
        'Lámpara LED con brillo regulable',
        'hogar',
        22.30
      ),
      (
        'Libro de JavaScript',
        'Guía práctica para principiantes',
        'libros',
        18.00
      )
  ) AS datos(nombre, descripcion, categoria, precio)
WHERE
  NOT EXISTS (
    SELECT
      1
    FROM
      productos
  );