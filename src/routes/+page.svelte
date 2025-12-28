<script lang="ts">
    import CanvasView from "../components/CanvasView.svelte";
    import ToolBar from "../components/ToolBar.svelte";
    import TopBar from "../components/TopBar.svelte";
    import DrawingTools from "../components/DrawingTools.svelte";
    import SearchBar from "../components/SearchBar.svelte";

</script>
<div class="relative w-full h-screen">
    <TopBar/>
    <CanvasView/>
    <ToolBar/>
    <DrawingTools/>
    <SearchBar/>
</div>