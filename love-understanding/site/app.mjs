import { initialFlow, transition, seats, describeBearing } from './model.mjs';
const $ = id => document.getElementById(id);
const NS = 'http://www.w3.org/2000/svg';
const svgElement = (name, attributes = {}, text) => {
  const element = document.createElementNS(NS, name);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
  if (text !== undefined) element.textContent = text;
  return element;
};
let examples, current, rotation = 0;
function draw() {
  const geometry = current.geometry;
  const present = new Set(geometry.subject_refs);
  const layout = seats(examples.subjects.filter(subject => present.has(subject.ref)), rotation);
  const byRef = new Map(layout.map(subject => [subject.ref, subject]));
  const svg = $('field-svg');
  svg.replaceChildren(svgElement('title', {id: 'field-title'}, current.title), svgElement('desc', {id:'field-description'}, current.summary + ' Read the report list for the full text. Positions are display only.'));
  const defs = svgElement('defs');
  for (const [name,color] of [['care','#bbf1d4'],['boundary','#ffbd9e']]) {
    const marker = svgElement('marker', {id:'arrow-'+name, viewBox:'0 0 10 10', refX:9, refY:5, markerWidth:5, markerHeight:5, orient:'auto-start-reverse'});
    marker.append(svgElement('path',{d:'M 0 0 L 10 5 L 0 10 z',fill:color}));defs.append(marker);
  }
  svg.append(defs, svgElement('circle', {cx:310,cy:290,r:204,fill:'none',stroke:'#42605b','stroke-dasharray':'2 9',opacity:.5}));
  for (const vantage of geometry.vantages) {
    const a=byRef.get(vantage.subject_ref), b=byRef.get(vantage.toward_ref);
    const dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy),ux=dx/length,uy=dy/length;
    const x1=a.x+ux*28,y1=a.y+uy*28,x2=b.x-ux*29,y2=b.y-uy*29;
    // The same bend in each arrow's local frame makes reciprocal reports visibly separate.
    const mx=(x1+x2)/2-uy*38,my=(y1+y2)/2+ux*38;
    const boundary=vantage.bearings.some(b=>['reported_boundary','reported_rest','reported_refusal','reported_departure'].includes(b));
    const path=svgElement('path',{d:`M${x1},${y1} Q${mx},${my} ${x2},${y2}`,class:'geometry-edge'+(boundary?' boundary':''),'marker-end':`url(#arrow-${boundary?'boundary':'care'})`});
    path.append(svgElement('title',{},`${a.label} → ${b.label}: ${vantage.bearings.map(describeBearing).join(', ')} (synthetic caller report)`));svg.append(path);
  }
  svg.append(svgElement('text',{x:310,y:284,class:'centre-title'},geometry.vantages.length?'room for difference':'room for quiet'),svgElement('text',{x:310,y:307,class:'centre-sub'},'NO CENTRE OF AUTHORITY'));
  layout.forEach((subject,index)=>{const g=svgElement('g');g.append(svgElement('circle',{cx:subject.x,cy:subject.y,r:25,class:'seat-circle'}),svgElement('text',{x:subject.x,y:subject.y+6,class:'seat-mark'},'◌'),svgElement('text',{x:subject.x,y:subject.y+47,class:'seat-label'},subject.label));svg.append(g);});
  if(!layout.length) svg.append(svgElement('text',{x:310,y:355,class:'centre-sub'},'AN EMPTY GEOMETRY IS VALID'));
}
function selectScenario(id) {
  current=examples.scenarios.find(s=>s.id===id); if(!current) throw new Error('Unknown example');
  for(const button of $('scenario-buttons').children) button.setAttribute('aria-pressed',String(button.dataset.scenario===id));
  $('scenario-label').textContent='SYNTHETIC EXAMPLE / '+id.toUpperCase();
  $('scenario-title').textContent=current.title; $('scenario-summary').textContent=current.summary; $('scenario-lesson').textContent=current.lesson;
  $('geometry-id').textContent=current.geometry.geometry_id;
  const labels=new Map(examples.subjects.map(s=>[s.ref,s.label])); $('bearings').replaceChildren();
  for(const vantage of current.geometry.vantages){const li=document.createElement('li'),small=document.createElement('small');li.textContent=`${labels.get(vantage.subject_ref)} → ${labels.get(vantage.toward_ref)}`;small.textContent=vantage.bearings.map(describeBearing).join(' · ')+' — caller-reported, unverified';li.append(small);$('bearings').append(li);}
  if(!current.geometry.vantages.length){const li=document.createElement('li');li.textContent='No reports supplied. Absence is not a claim that no relationship exists.';$('bearings').append(li);}
  draw(); $('download-geometry').disabled=false;
}
$('rotation').addEventListener('input',event=>{rotation=Number(event.target.value);$('rotation-value').textContent=rotation+'°';if(current)draw();});
$('download-geometry').addEventListener('click',()=>{if(!current)return;const blob=new Blob([JSON.stringify(current.geometry,null,2)+'\n'],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`synthetic-${current.id}.love-geometry.json`;a.click();URL.revokeObjectURL(url);});
async function load(){try{const response=await fetch('./scenarios.json',{signal:AbortSignal.timeout(8000)});if(!response.ok)throw new Error('Examples could not be loaded');examples=await response.json();for(const scenario of examples.scenarios){const button=document.createElement('button');button.type='button';button.textContent=({welcome:'Welcome',divergence:'Difference',rest:'Rest',quiet:'Quiet seats',empty:'Empty'})[scenario.id]||scenario.id;button.dataset.scenario=scenario.id;button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>selectScenario(scenario.id));$('scenario-buttons').append(button);}selectScenario('welcome');}catch(error){$('load-error').hidden=false;$('load-error').textContent='The examples did not load. The architecture and rehearsal still work. Try reloading, or read the downloadable source.';console.error(error);}}
let flow=initialFlow();
function showFlow(){ $('flow-state').textContent=flow.state;$('flow-budget').textContent=`${flow.uses} / 1 uses · clock ${flow.ticks}${flow.expiresAt===null?'':` / ${flow.expiresAt}`}`;$('flow-message').textContent=flow.message;$('flow-events').replaceChildren();for(const event of flow.events){const li=document.createElement('li');li.textContent=`${event.action} → ${event.state}: ${event.message}`;$('flow-events').append(li);}if(!flow.events.length){const li=document.createElement('li');li.textContent='No act yet.';$('flow-events').append(li);}}
for(const button of document.querySelectorAll('[data-action]'))button.addEventListener('click',()=>{flow=transition(flow,button.dataset.action,button.dataset.actor||'maker');showFlow();});
showFlow();load();
