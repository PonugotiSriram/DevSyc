import React from 'react';
import { Tldraw } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';

const Board = () => {
  return (
    <div style={{ position: 'fixed', inset: 0, marginLeft: '4.5rem', zIndex: 10 }}>
      <Tldraw persistenceKey="devsync-board" />
    </div>
  );
};

export default Board;
