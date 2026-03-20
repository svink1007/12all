import {useEffect} from 'react';

const useRemoveFromStyleFromParent = (gridId: string, rowId: string) => {
  useEffect(() => {
    const grid = document.getElementById(gridId);
    const row = document.getElementById(rowId);

    if (grid && row) {
      const observer = new MutationObserver(() => {
        grid.style.height = '';
        grid.style.minHeight = '';
        row.style.height = '';
        row.style.minHeight = '';
      });

      observer.observe(grid, {
        attributes: true,
        attributeFilter: ['style']
      });
    }
  }, [gridId, rowId]);
};

export default useRemoveFromStyleFromParent;
