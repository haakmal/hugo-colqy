/* Colqy: editable Hugo shortcodes with Sveltia-native image widgets. */
(() => {
  'use strict';
  if (!window.CMS) return;
  const clean = v => String(v ?? '').replace(/["\r\n]/g,' ').trim();
  const image = name => ({name,label:'Image',widget:'image',required:true});
  const makePreview = (label,detail,src,alt,getAsset) => {
    const box=document.createElement('div');
    box.className='cq-editor-preview cq-editor-figure-preview';
    const title=document.createElement('strong');title.textContent=label;box.append(title);
    if(src){const img=document.createElement('img');img.src=getAsset?.(src)?.url || src;
      img.alt=alt || '';img.className='cq-editor-preview-image';box.append(img);}
    const text=document.createElement('small');text.textContent=detail;box.append(text);return box;
  };
  // A5.4b.2: preview all gallery images rather than only the first.
  const makeGalleryPreview = (label, columns, images, getAsset) => {
    const entries = Array.isArray(images) ? images : [];
    const box = document.createElement('div');
    box.className = 'colqy-gallery-preview cq-editor-preview';
    // Shared editor-preview CSS supplies layout, contrast and spacing.
    const heading = document.createElement('strong');
    heading.textContent = `${label || 'Image gallery'} · ${entries.length} images`;
    box.append(heading);
    const grid = document.createElement('div');
    const count = columns === '3' ? 3 : 2;
    grid.className='cq-editor-gallery-grid';grid.style.setProperty('--cq-preview-columns',String(count));
    for (const item of entries) {
      const figure = document.createElement('figure');
      figure.className='cq-editor-gallery-item';
      if (item?.src) {
        const img = document.createElement('img');
        img.src = getAsset?.(item.src)?.url || item.src;
        img.alt = item.alt || '';
        img.className='cq-editor-gallery-image';
        figure.append(img);
      }
      const detail = item?.caption || item?.alt;
      if (detail) {
        const caption = document.createElement('figcaption');
        caption.textContent = detail;
        caption.className='cq-editor-gallery-caption';
        figure.append(caption);
      }
      grid.append(figure);
    }
    box.append(grid);
    return box;
  };
  CMS.registerEditorComponent({
    id:'colqy-figure',label:'Figure',icon:'image',mode:'dialog',summary:'Figure · {{caption}}',thumbnail:'src',
    pattern:/\{\{< figure src="(?<src>[^"]*)" alt="(?<alt>[^"]*)" caption="(?<caption>[^"]*)" width="(?<width>[^"]*)" >\}\}/,
    fields:[image('src'),{name:'alt',label:'Alt text',widget:'string'},
      {name:'caption',label:'Caption',widget:'string',required:false},
      {name:'width',label:'Width',widget:'select',options:['standard','wide'],default:'standard'}],
    toBlock:({src='',alt='',caption='',width='standard'}={})=>`{{< figure src="${clean(src)}" alt="${clean(alt)}" caption="${clean(caption)}" width="${clean(width)}" >}}`,
    toPreview:({src='',alt='',caption='',width='standard'}={},getAsset)=>makePreview(`Figure · ${width}`,caption,src,alt,getAsset)
  });
  CMS.registerEditorComponent({
    id:'colqy-split',label:'Image + text',icon:'view_sidebar',mode:'block',collapsed:false,
    pattern:/\{\{< split src="(?<src>[^"]*)" alt="(?<alt>[^"]*)" side="(?<side>[^"]*)" caption="(?<caption>[^"]*)" >\}\}\s*\n(?<body>[\s\S]*?)\n\{\{< \/split >\}\}/,
    fields:[image('src'),{name:'alt',label:'Alt text',widget:'string'},
      {name:'side',label:'Image position',widget:'select',options:['left','right'],default:'left'},
      {name:'caption',label:'Caption',widget:'string',required:false},
      {name:'body',label:'Text beside image',widget:'richtext',format:'markdown',required:false,
        allow_nested_components:false,editor_components:[],
        hint:'Use headings, paragraphs, lists, quotes and links. The text is rendered alongside the image.'}],
    toBlock:({src='',alt='',side='left',caption='',body=''}={})=>
      `{{< split src="${clean(src)}" alt="${clean(alt)}" side="${clean(side)}" caption="${clean(caption)}" >}}\n${String(body).replace(/\n+$/,'')}\n{{< /split >}}`,
    toPreview:({src='',alt='',side='left',caption='',body=''}={},getAsset)=>{
      const wrapper=document.createElement('div');
      wrapper.className='colqy-split-preview cq-editor-preview cq-editor-split-preview';
      // Responsive layout comes from the scoped editorial stylesheet.
      const media=document.createElement('figure');media.className='cq-editor-split-media';
      if(src){const img=document.createElement('img');img.src=getAsset?.(src)?.url || src;img.alt=alt || '';img.className='cq-editor-split-image';media.append(img);}
      if(caption){const figcaption=document.createElement('figcaption');figcaption.textContent=caption;media.append(figcaption);}
      const copy=document.createElement('div');copy.className='cq-editor-split-copy';
      const destroy=CMS.renderRichText(copy,body,{fieldConfig:{editor_components:[]}});
      copy.addEventListener('Unmount',destroy,{once:true});
      if(side==='right'){wrapper.append(copy,media);}else{wrapper.append(media,copy);}
      return wrapper;
    }
  });
  const galleryPattern=/\{\{< gallery columns="(?<columns>[23])" label="(?<label>[^"]*)" >\}\}(?<items>[\s\S]*?)\{\{< \/gallery >\}\}/;
  const itemPattern=/\{\{< gallery-item src="([^"]*)" alt="([^"]*)"(?: caption="([^"]*)")? >\}\}/g;
  CMS.registerEditorComponent({
    id:'colqy-gallery',label:'Gallery',icon:'view_module',mode:'block',collapsed:false,
    pattern:galleryPattern,
    fromBlock:match=>({
      columns:match.groups.columns,label:match.groups.label,
      images:[...match.groups.items.matchAll(itemPattern)].map(m=>({src:m[1],alt:m[2],caption:m[3]||''}))
    }),
    fields:[
      {name:'label',label:'Gallery description',widget:'string',default:'Image gallery'},
      {name:'columns',label:'Columns',widget:'select',options:['2','3'],default:'2'},
      {name:'images',label:'Images (add, reorder or remove)',widget:'list',required:true,collapsed:false,
        label_singular:'Image',thumbnail:'src',summary:'{{fields.alt}}',
        fields:[image('src'),{name:'alt',label:'Alt text',widget:'string'},
          {name:'caption',label:'Caption',widget:'string',required:false}]}],
    toBlock:({label='Image gallery',columns='2',images=[]}={})=>
      `{{< gallery columns="${clean(columns)}" label="${clean(label)}" >}}\n`+
      (Array.isArray(images)?images:[]).map(({src='',alt='',caption=''}={})=>
        `  {{< gallery-item src="${clean(src)}" alt="${clean(alt)}" caption="${clean(caption)}" >}}`).join('\n')+
      '\n{{< /gallery >}}',
    toPreview:({label='Image gallery',columns='2',images=[]}={},getAsset)=>
      makeGalleryPreview(label,columns,images,getAsset)
  });
  CMS.init();
})();
