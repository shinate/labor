<template>
    <div>
        <div v-for="c in cl">
            <button-counter :c="c"></button-counter>
        </div>
    </div>
</template>

<script>
    export default {
        props: ['list']
    }
</script>