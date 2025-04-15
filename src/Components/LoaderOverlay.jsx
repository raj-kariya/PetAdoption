import React from "react";
export default function LoaderOverlay() {
    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999,
            }}
        >
            <img src="/Loading_icon.gif" alt="Loading..." style={{ width: '50px', height: '50px' }} />
        </div>
    );
}