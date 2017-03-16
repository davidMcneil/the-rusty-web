x = [2, 4, 8, 16, 32, 64];
native_rust = [19, 25, 35, 54, 90, 155];
chromium_59_javascript =  [190, 224, 369, 915, 1935, 3653];
chromium_59_rust_asmjs =  [125, 126, 154, 181, 293, 511];
chromium_59_rust_wasm =  [61, 76, 95, 121, 182, 320];
firefox_55_javascript = [99, 136, 217, 382, 683, 1282];
firefox_55_rust_asmjs = [126, 128, 140, 189, 291, 488];
firefox_55_rust_wasm =  [122, 131, 148, 179, 233, 329];

figure;
hold on;



plot (x, chromium_59_javascript, '-*', 'Color', 'blue', 'MarkerFaceColor','blue','LineWidth',2);
plot (x, firefox_55_javascript, '-v', 'Color', 'red', 'MarkerFaceColor','red','LineWidth',2);
plot (x, chromium_59_rust_asmjs, '-o', 'Color', 'magenta', 'MarkerFaceColor','magenta','LineWidth',2);
plot (x, firefox_55_rust_asmjs, '->', 'Color', [1, 0.5, 0], 'MarkerFaceColor',[1, 0.5, 0],'LineWidth',2);
plot (x, firefox_55_rust_wasm, '-^', 'Color', [0.9, 0.8, 0], 'MarkerFaceColor',[0.9, 0.8, 0],'LineWidth',2);
plot(x, chromium_59_rust_wasm, '-+', 'Color', 'green', 'MarkerFaceColor','green','LineWidth',2);
plot(x, native_rust, '-d', 'Color', 'black', 'MarkerFaceColor','black','LineWidth',2);
xlim([0 64]);
set(gca,'Ygrid','on');
set(gca,'Xgrid','on');
set(gca,'Xtick', 0:4:64);
set(gca, 'FontSize', 14)
xlabel('k');
ylabel('Average Step Time (ms)');
title('Benchmarks');
legend('Chromium 59 JavaScript','Firefox 55 JavaScript','Chromium 59 Rust (asmjs)','Firefox 55 Rust (asmjs)','Firefox 55 Rust (wasm)','Chromium 59 Rust (wasm)','Native Rust','Location', 'NorthWest')