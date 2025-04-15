export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const runWithLoader = async (setLoading, asyncFn) => {
    setLoading(true);
    try { await sleep(100); await asyncFn(); } catch (err) { console.error(err); } finally { setLoading(false); }
};
