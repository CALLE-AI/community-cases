export const cases = {
  'conversation-clarify': {
    name:'Conversation-Clarify', kind:'office', chapters:['Inspect','Approve','Call','Review'],
    titles:['A reply leaves a choice open.','Review one question.','Hear the missing detail.','A draft, ready for your review.'],
    lines:['“That sounds fine” does not choose morning or afternoon.','Check the question and masked destination before calling.','“Afternoon, please.” Keep the words that support the answer.','Review the draft, original thread and recipient before sending.'],
    narration:'An email says, that sounds fine. But morning or afternoon is still unanswered. Review the question and destination, then approve one call. The person chooses afternoon. Their words support a reply draft. Review the draft and recipient yourself before sending.',
    labels:['Email thread','One approved call','Reply draft'],
    mockIntro:'Inspect the missing choice, approve a simulated call and decide whether the answer supports a draft.'
  },
  'care-call-ai': {
    name:'Care Call AI', kind:'care', chapters:['Approve','Listen','Combine','Handoff'],
    titles:['A check-in starts with approval.','Listen for everyday needs.','Keep the earlier request.','Review one team handoff.'],
    lines:['A coordinator reviews the fictional recipient and outreach purpose.','The person asks for help with cleaning.','A later callback adds groceries; cleaning stays on the list.','A reviewed sheet helps the team arrange support. It does not confirm delivery.'],
    narration:'Approve a support check-in. First, Morgan asks for help with cleaning. A later call adds groceries. Keep both requests. Review both requests together before arranging any help.',
    labels:['Coordinator','Check-in','Team handoff'],
    mockIntro:'Approve a fictional check-in, preserve same-day requests and review the handoff. Independently authored workflow simulation; no proprietary application code.'
  },
  ringback: {
    name:'RingBack', kind:'studio', chapters:['Opening','Offer','Accept','Book'],
    titles:['An appointment opens up.','Offer the slot in order.','One clear acceptance.','Check, then fill the diary.'],
    lines:['A fictional studio has a Thursday opening at 2:00 PM.','Alex declines. The next eligible contact is Sam.','Sam accepts; Taylor is not called for this opening.','Confirm the opening is still available before saving to the local diary.'],
    narration:'A Thursday appointment opens up. RingBack offers it to the waiting list, one person at a time. Alex declines. Sam accepts, so Taylor is not called. Check that the slot is still available, then save the replacement in the local diary.',
    labels:['Open appointment','Waiting list','Local diary'],
    mockIntro:'Offer one opening in order. Try acceptance, an unclear answer, or a slot that becomes unavailable before saving.'
  },
  hungrycall: {
    name:'HungryCall', kind:'restaurants', chapters:['Brief','Check','Match','Stop'],
    titles:['Delivery, within your budget.','Check restaurants in order.','A restaurant meets the conditions.','Stop with one match.'],
    lines:['The fictional brief requires delivery with a maximum total price.','Trattoria is over budget. Burger House cannot deliver.','Asia Wok confirms delivery and a total within the limit.','Keep the result and leave Sushi Kudo uncalled. This simulation places no order.'],
    narration:'Set a budget and require delivery. One restaurant costs too much. The next cannot deliver. The third restaurant meets both conditions. Keep the match and stop calling without placing an order.',
    labels:['Your brief','Restaurant calls','Delivery match'],
    mockIntro:'Change the budget, then inspect one saved restaurant response at a time. The sequence stops at the first match.'
  }
};
export const restaurants=[{name:'Trattoria',price:32,delivery:true},{name:'Burger House',price:18,delivery:false},{name:'Asia Wok',price:24,delivery:true},{name:'Sushi Kudo',price:29,delivery:true}];
export function restaurantDecision(restaurant,budget){return !restaurant.delivery?'No delivery':restaurant.price>budget?'Over budget':'Match';}
export function draftFrom(answer){return answer==='afternoon'?'Thanks for confirming the afternoon visit.':null;}
export function addNeed(needs,need){return needs.includes(need)?needs:[...needs,need];}
export function canBook(answer,available){return answer==='accepted'&&available;}
export function initialState(){return {step:0,calls:0,history:[],needs:[],done:false,title:'Ready to explore.',body:'Review the sample settings, then start the simulation.',action:'Start simulation'};}
export function advanceMock(id,state,settings={}){
  if(state.done)return state;
  const s={...state,history:[...state.history],needs:[...state.needs],step:state.step+1};
  function result(title,body,action,done=false){return Object.assign(s,{title,body,action,done});}
  if(id==='conversation-clarify'){
    if(s.step===1)return result('A choice is still open.','Email: “That sounds fine.” Question: “Morning or afternoon?” Destination: fictional contact · ending 0142.','Approve simulated call');
    if(s.step===2){s.calls=1;s.history.push(settings.answer==='afternoon'?'Phone quote: “Afternoon, please.”':'Phone result: no clear choice.');return result('Read the call result.',s.history.at(-1),'Review answer');}
    const draft=draftFrom(settings.answer);return result(draft?'Draft ready for review.':'Keep the question open.',draft?draft+' Check the recipient and original thread yourself; nothing has been sent.':'This sample has no supported choice. No draft is produced. A human decides what to do next.','Completed',true);
  }
  if(id==='care-call-ai'){
    if(s.step===1)return result('Review the check-in.','Fictional recipient: Morgan. Purpose: everyday cleaning and groceries. A coordinator must approve outreach.','Approve simulated check-in');
    if(s.step===2){s.calls=1;s.needs=addNeed(s.needs,'Cleaning');s.history.push('First check-in: “Could someone help with cleaning?”');return result('Cleaning request recorded.',s.history.at(-1),'Add same-day callback');}
    if(s.step===3){s.calls=2;if(settings.callback==='groceries'){s.needs=addNeed(s.needs,'Groceries');s.history.push('Callback: “I also need groceries.”');}else{s.history.push('Callback unclear: coordinator review required.');}return result('Earlier needs stay on the list.',s.history.at(-1),'Review handoff');}
    return result('Handoff ready for coordinator review.',s.needs.join(' + ')+'. '+(settings.callback==='unclear'?'The unclear callback is flagged for follow-up. ':'')+'Support has not been arranged or delivered by this mock.','Completed',true);
  }
  if(id==='ringback'){
    if(s.step===1)return result('Thursday · 2:00 PM.','One fictional opening. Eligible waiting list: Alex, Sam, Taylor.','Approve and offer to Alex');
    if(s.step===2){s.calls=1;s.history.push('Alex declined.');return result('Alex cannot take this time.','Continue to Sam; no simultaneous offers.','Offer to Sam');}
    if(s.step===3){s.calls=2;s.history.push(settings.answer==='accepted'?'Sam accepted. Taylor not called.':'Sam’s answer is unclear. Pause for review.');return result(settings.answer==='accepted'?'Sam accepts the opening.':'Human review needed.',s.history.at(-1),settings.answer==='accepted'?'Check availability and save':'Completed',settings.answer!=='accepted');}
    return result(canBook(settings.answer,settings.available)?'Saved in the local diary.':'The slot is no longer available.',canBook(settings.answer,settings.available)?'Thursday · 2:00 PM → Sam. Two simulated calls. Taylor remains uncalled.':'No booking saved. A coordinator must resolve the conflict. Taylor remains uncalled.','Completed',true);
  }
  if(id==='hungrycall'){
    if(!Number.isFinite(settings.budget)||settings.budget<1||settings.budget>100)return {...state,title:'Enter a budget from $1 to $100.',body:'Use a valid maximum total price before starting.'};
    if(s.step===1)return result('Delivery required. Maximum $'+settings.budget+'.','Fictional address: 12 Example Lane. Check total price including delivery.','Check Trattoria');
    const r=restaurants[s.step-2],decision=restaurantDecision(r,settings.budget);s.calls++;s.history.push(r.name+': '+decision+' · $'+r.price+' total');
    const matched=decision==='Match',last=s.step===5;return result(matched?'One delivery match.':last?'No match within the brief.':'Continue the search.',matched?r.name+' meets the sample conditions. Later restaurants are not called. No order has been placed.':s.history.at(-1),matched||last?'Completed':'Check '+restaurants[s.step-1].name,matched||last);
  }
  throw new Error('Unknown case');
}
