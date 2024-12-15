<template>
    <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Loading...</p>
    </div>
</template>

<style scoped>
.loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100px;
}

.spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border-left-color: var(--interactive-accent);
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

p {
    margin-top: 10px;
    color: var(--text-muted);
}
</style>

